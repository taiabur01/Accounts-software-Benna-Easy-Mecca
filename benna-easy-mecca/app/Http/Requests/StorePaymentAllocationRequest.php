<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentAllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_transaction_id' => ['required', 'integer', 'exists:payment_transactions,id'],

            'allocations' => ['required', 'array', 'min:1'],

            // 'invoice'  -> allocates against invoice_masters (used when the payment is a RECEIVE)
            // 'purchase' -> allocates against purchase_masters (used when the payment is a PAYMENT)
            'allocations.*.allocatable_type' => ['required', 'in:invoice,purchase'],
            'allocations.*.allocatable_id' => ['required', 'integer', 'min:1'],
            'allocations.*.allocated_amount' => ['required', 'numeric', 'min:0.01'],
        ];
    }

    public function messages(): array
    {
        return [
            'allocations.*.allocatable_type.in' => 'allocatable_type must be either "invoice" or "purchase".',
        ];
    }
}
