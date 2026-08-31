<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\GCode;
use App\Models\PaymentTransaction;
use App\Services\DocumentNumberService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        return PaymentTransaction::with(['agency', 'gCode'])
            ->orderByDesc('transaction_date')
            ->paginate(20);
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
