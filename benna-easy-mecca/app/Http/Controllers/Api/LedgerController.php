<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\GCode;
use App\Models\InvoiceMaster;
use App\Models\PurchaseMaster;
use App\Models\PaymentTransaction;
use App\Models\PaymentAllocation;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LedgerController extends Controller
{
    public function index(Request $request, Agency $agency)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $gCodeId = $request->query('g_code_id');

        // G-Code Isolation Verification
        if ($gCodeId) {
            $valid = GCode::where('id', $gCodeId)->where('agency_id', $agency->id)->exists();
            if (!$valid) {
                throw ValidationException::withMessages([
                    'g_code_id' => 'This G-Code does not belong to the selected agency.',
                ]);
            }
        }

        // 1. Initial Opening Balance setup (Omitted if G-Code filtered to maintain raw mathematical consistency)
        $openingBalance = $gCodeId ? 0 : (float) $agency->opening_balance;
        if (!$gCodeId && $agency->opening_balance_type === 'CR') {
            $openingBalance = -$openingBalance;
        }

        // 2. Adjust Opening Balance for prior dates
        if ($startDate) {
            $priorInvoices = InvoiceMaster::where('agency_id', $agency->id)
                ->when($gCodeId, fn($q) => $q->where('g_code_id', $gCodeId))
                ->where('invoice_date', '<', $startDate)->sum('total_amount');
                
            $priorPurchases = PurchaseMaster::where('agency_id', $agency->id)
                ->when($gCodeId, fn($q) => $q->where('g_code_id', $gCodeId))
                ->where('purchase_date', '<', $startDate)->sum('total_amount');
                
            $priorPaymentsIn = PaymentTransaction::where('agency_id', $agency->id)
                ->when($gCodeId, fn($q) => $q->where('g_code_id', $gCodeId))
                ->where('transaction_type', 'RECEIVE')
                ->where('transaction_date', '<', $startDate)->sum('sar_amount');
                
            $priorPaymentsOut = PaymentTransaction::where('agency_id', $agency->id)
                ->when($gCodeId, fn($q) => $q->where('g_code_id', $gCodeId))
                ->where('transaction_type', 'PAYMENT')
                ->where('transaction_date', '<', $startDate)->sum('sar_amount');

            $openingBalance += $priorInvoices;     
            $openingBalance -= $priorPurchases;    
            $openingBalance -= $priorPaymentsIn;   
            $openingBalance += $priorPaymentsOut;  
        }

        // 3. Fetch Transactions within Date Range
        $invoicesRaw = InvoiceMaster::with('gCode')->where('agency_id', $agency->id)
            ->when($gCodeId, fn($q) => $q->where('g_code_id', $gCodeId))
            ->when($startDate, fn($q) => $q->where('invoice_date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->where('invoice_date', '<=', $endDate))
            ->get();

        $purchasesRaw = PurchaseMaster::with('gCode')->where('agency_id', $agency->id)
            ->when($gCodeId, fn($q) => $q->where('g_code_id', $gCodeId))
            ->when($startDate, fn($q) => $q->where('purchase_date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->where('purchase_date', '<=', $endDate))
            ->get();

        $paymentsRaw = PaymentTransaction::with('gCode')->where('agency_id', $agency->id)
            ->when($gCodeId, fn($q) => $q->where('g_code_id', $gCodeId))
            ->when($startDate, fn($q) => $q->where('transaction_date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->where('transaction_date', '<=', $endDate))
            ->get();

        $invoices = $invoicesRaw->map(fn($inv) => [
            'date' => $inv->invoice_date->format('Y-m-d'),
            'type' => 'INVOICE',
            'reference' => $inv->invoice_no,
            'particulars' => 'Invoice / Sales',
            'g_code' => $inv->gCode->code,
            'debit' => (float) $inv->total_amount,
            'credit' => 0,
            'created_at' => $inv->created_at,
        ]);

        $purchases = $purchasesRaw->map(fn($pur) => [
            'date' => $pur->purchase_date->format('Y-m-d'),
            'type' => 'PURCHASE',
            'reference' => $pur->purchase_no,
            'particulars' => 'Purchase / Bill',
            'g_code' => $pur->gCode->code,
            'debit' => 0,
            'credit' => (float) $pur->total_amount,
            'created_at' => $pur->created_at,
        ]);

        $payments = $paymentsRaw->map(function($pay) {
            $isReceive = $pay->transaction_type === 'RECEIVE';
            return [
                'date' => $pay->transaction_date->format('Y-m-d'),
                'type' => 'PAYMENT',
                'reference' => $pay->voucher_no,
                'particulars' => 'Payment ' . ($isReceive ? 'Received' : 'Sent') . ' - ' . $pay->mode_of_payment,
                'g_code' => $pay->gCode->code,
                'debit' => $isReceive ? 0 : (float) $pay->sar_amount,
                'credit' => $isReceive ? (float) $pay->sar_amount : 0,
                'created_at' => $pay->created_at,
            ];
        });

        // 4. Merge, Sort, and Calculate Running Balance
        $transactions = collect([])
            ->concat($invoices)->concat($purchases)->concat($payments)
            ->sortBy([['date', 'asc'], ['created_at', 'asc']])->values();

        $runningBalance = $openingBalance;
        $ledger = $transactions->map(function ($t) use (&$runningBalance) {
            $runningBalance += $t['debit'];
            $runningBalance -= $t['credit'];
            
            $t['balance'] = abs($runningBalance);
            $t['balance_type'] = $runningBalance >= 0 ? 'DR' : 'CR';
            return $t;
        });

        // 5. Allocation-aware Summary Calculation (FIXED: Avoids double counting & respects date boundaries)
        $invoiceIds = $invoicesRaw->pluck('id');
        $purchaseIds = $purchasesRaw->pluck('id');
        $paymentIds = $paymentsRaw->pluck('id');

        $totalReconciled = PaymentAllocation::where(function($q) use ($invoiceIds, $purchaseIds, $paymentIds) {
            $q->whereIn('payment_transaction_id', $paymentIds)
              ->orWhere(function($sq) use ($invoiceIds) {
                  $sq->where('allocatable_type', InvoiceMaster::class)
                     ->whereIn('allocatable_id', $invoiceIds);
              })
              ->orWhere(function($sq) use ($purchaseIds) {
                  $sq->where('allocatable_type', PurchaseMaster::class)
                     ->whereIn('allocatable_id', $purchaseIds);
              });
        })->sum('allocated_amount');

        return response()->json([
            'summary' => [
                'agency_name' => $agency->agency_name,
                'agency_type' => $agency->agency_type,
                'opening_balance' => abs($openingBalance),
                'opening_balance_type' => $openingBalance >= 0 ? 'DR' : 'CR',
                'total_invoiced' => $invoicesRaw->sum('total_amount'),
                'total_purchased' => $purchasesRaw->sum('total_amount'),
                'total_received' => $paymentsRaw->where('transaction_type', 'RECEIVE')->sum('sar_amount'),
                'total_paid' => $paymentsRaw->where('transaction_type', 'PAYMENT')->sum('sar_amount'),
                'total_reconciled' => (float) $totalReconciled,
                'closing_balance' => abs($runningBalance),
                'closing_balance_type' => $runningBalance >= 0 ? 'DR' : 'CR',
            ],
            'transactions' => $ledger,
        ]);
    }
}