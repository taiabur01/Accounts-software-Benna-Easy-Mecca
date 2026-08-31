<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\GCode;
use App\Models\PaymentTransaction;
use App\Services\DocumentNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * GET /api/payments
     * GET /api/payments?agency_id=5
     * GET /api/payments?agency_id=5&transaction_type=RECEIVE&per_page=100
     *
     * NEW (Reconcile Payment screen): optional `agency_id` and
     * `transaction_type` filters, plus an optional `per_page` override
     * (default stays 20, same as before). Also eager-loads the
     * allocated_amount sum via withSum so PaymentTransaction's
     * allocated_amount / unallocated_amount accessors don't run one
     * extra query per row.
     */
    public function index(Request $request)
    {
        return PaymentTransaction::with(['agency', 'gCode'])
            ->when($request->filled('agency_id'), fn ($q) => $q->where('agency_id', $request->agency_id))
            ->when($request->filled('transaction_type'), fn ($q) => $q->where('transaction_type', $request->transaction_type))
            ->withSum('allocations as allocations_sum_allocated_amount', 'allocated_amount')
            ->orderByDesc('transaction_date')
            ->paginate($request->integer('per_page', 20));
    }

    public function storePayment(StorePaymentRequest $request)
    {
        $validated = $request->validated();

        $payment = DB::transaction(function () use ($validated) {
            $gCode = GCode::findOrFail($validated['g_code_id']);

            $financialYear = Carbon::parse($validated['transaction_date'])->year;
            $voucherNo = DocumentNumberService::next('VOU', (string) $financialYear);

            $bdAmount = $validated['bd_amount'] ?? null;
            $rate = $validated['exchange_rate'] ?? null;

            if ($validated['transaction_type'] === 'PAYMENT') {
                // BD amount + rate are entered; SAR is derived.
                $sarAmount = round($bdAmount / $rate, 2);
            } else {
                // RECEIVE: SAR amount is entered directly.
                $sarAmount = $validated['sar_amount'];
            }

            return PaymentTransaction::create([
                'voucher_no' => $voucherNo,
                'transaction_date' => $validated['transaction_date'],
                'agency_id' => $gCode->agency_id,
                'g_code_id' => $gCode->id,
                'transaction_type' => $validated['transaction_type'],
                'mode_of_payment' => $validated['mode_of_payment'],
                'bd_amount' => $bdAmount,
                'exchange_rate' => $rate,
                'sar_amount' => $sarAmount,
                'note' => $validated['note'] ?? null,
            ]);
        });

        return response()->json($payment, 201);
    }
}
