<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentAllocationRequest;
use App\Models\Agency;
use App\Models\InvoiceMaster;
use App\Models\PaymentAllocation;
use App\Models\PaymentTransaction;
use App\Models\PurchaseMaster;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentAllocationController extends Controller
{
    /**
     * Maps the short, frontend-friendly "allocatable_type" values to their Eloquent model class.
     */
    private const ALLOCATABLE_MODELS = [
        'invoice' => InvoiceMaster::class,
        'purchase' => PurchaseMaster::class,
    ];

    /**
     * POST /api/payment-allocations
     *
     * Body:
     * {
     *   "payment_transaction_id": 12,
     *   "allocations": [
     *     { "allocatable_type": "invoice", "allocatable_id": 5, "allocated_amount": 1500.00 },
     *     { "allocatable_type": "invoice", "allocatable_id": 9, "allocated_amount": 500.00 }
     *   ]
     * }
     *
     * Rules enforced:
     * - A RECEIVE payment may only be allocated against invoices; a PAYMENT payment only against purchase bills.
     * - The target document must belong to the same agency as the payment.
     * - Total requested amount cannot exceed the payment's remaining unallocated amount.
     * - Each individual allocation cannot exceed that document's remaining due amount.
     * All checks + writes happen inside one locked DB transaction to stay correct under concurrent requests.
     */
    public function allocatePayment(StorePaymentAllocationRequest $request)
    {
        $validated = $request->validated();

        $createdAllocations = DB::transaction(function () use ($validated) {
            /** @var PaymentTransaction $payment */
            $payment = PaymentTransaction::whereKey($validated['payment_transaction_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $expectedType = $payment->transaction_type === 'RECEIVE' ? 'invoice' : 'purchase';

            $requestedTotal = 0;
            foreach ($validated['allocations'] as $row) {
                $requestedTotal += (float) $row['allocated_amount'];

                if ($row['allocatable_type'] !== $expectedType) {
                    throw ValidationException::withMessages([
                        'allocations' => "This payment is a {$payment->transaction_type} transaction, "
                            . "so it can only be allocated against a \"{$expectedType}\", not \"{$row['allocatable_type']}\".",
                    ]);
                }
            }
            $requestedTotal = round($requestedTotal, 2);

            $alreadyAllocated = (float) $payment->allocations()->sum('allocated_amount');
            $remainingOnPayment = round((float) $payment->sar_amount - $alreadyAllocated, 2);

            if ($requestedTotal > $remainingOnPayment) {
                throw ValidationException::withMessages([
                    'allocations' => "Requested allocation total ({$requestedTotal}) exceeds this payment's "
                        . "unallocated balance ({$remainingOnPayment}).",
                ]);
            }

            $created = [];

            foreach ($validated['allocations'] as $row) {
                $modelClass = self::ALLOCATABLE_MODELS[$row['allocatable_type']];

                /** @var InvoiceMaster|PurchaseMaster $document */
                $document = $modelClass::whereKey($row['allocatable_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ((int) $document->agency_id !== (int) $payment->agency_id) {
                    throw ValidationException::withMessages([
                        'allocations' => "{$row['allocatable_type']} #{$document->id} belongs to a different "
                            . 'agency than this payment. Allocation refused.',
                    ]);
                }

                $docAlreadyAllocated = (float) $document->allocations()->sum('allocated_amount');
                $docDue = round((float) $document->total_amount - $docAlreadyAllocated, 2);
                $requestedAmount = round((float) $row['allocated_amount'], 2);

                if ($requestedAmount > $docDue) {
                    throw ValidationException::withMessages([
                        'allocations' => "Cannot allocate {$requestedAmount} to {$row['allocatable_type']} "
                            . "#{$document->id} — its remaining due is only {$docDue}.",
                    ]);
                }

                $created[] = PaymentAllocation::create([
                    'payment_transaction_id' => $payment->id,
                    'allocatable_id' => $document->id,
                    'allocatable_type' => $modelClass,
                    'allocated_amount' => $requestedAmount,
                ]);
            }

            return $created;
        });

        $result = (new \Illuminate\Database\Eloquent\Collection($createdAllocations))
            ->load('allocatable', 'paymentTransaction');

        return response()->json($result, 201);
    }

    /**
     * DELETE /api/payment-allocations/{allocation}
     * Reverses a single allocation, freeing up both the payment's and the document's balance.
     */
    public function destroy(PaymentAllocation $allocation)
    {
        $allocation->delete();

        return response()->json(['message' => 'Allocation reversed.']);
    }

    /**
     * GET /api/agencies/{agency}/unpaid-invoices
     * Outstanding (due > 0) invoices for a BD agency, oldest first — feeds the "Reconcile Payment" screen.
     */
    public function getUnpaidInvoices(Agency $agency)
    {
        $invoices = InvoiceMaster::where('agency_id', $agency->id)
            ->withSum('allocations as allocations_sum_allocated_amount', 'allocated_amount')
            ->orderBy('invoice_date')
            ->get()
            ->filter(fn (InvoiceMaster $invoice) => $invoice->due_amount > 0)
            ->values();

        return response()->json($invoices);
    }

    /**
     * GET /api/agencies/{agency}/unpaid-purchases
     * Outstanding (due > 0) purchase bills for a Saudi agency, oldest first.
     */
    public function getUnpaidPurchases(Agency $agency)
    {
        $purchases = PurchaseMaster::where('agency_id', $agency->id)
            ->withSum('allocations as allocations_sum_allocated_amount', 'allocated_amount')
            ->orderBy('purchase_date')
            ->get()
            ->filter(fn (PurchaseMaster $purchase) => $purchase->due_amount > 0)
            ->values();

        return response()->json($purchases);
    }

    /**
     * GET /api/payment-transactions/{payment}/allocations
     * Full allocation history + remaining balance for a single payment.
     */
    public function getAllocationHistory(PaymentTransaction $payment)
    {
        return response()->json(
            $payment->load('allocations.allocatable', 'agency', 'gCode')
        );
    }
}
