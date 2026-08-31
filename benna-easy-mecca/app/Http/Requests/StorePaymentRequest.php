<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_date' => ['required', 'date'],
            'g_code_id' => ['required', 'exists:g_codes,id'],
            'transaction_type' => ['required', 'in:RECEIVE,PAYMENT'],
            'mode_of_payment' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string'],

            // PAYMENT (to Saudi agency): BD amount + rate are entered, SAR is computed.
            'bd_amount' => ['required_if:transaction_type,PAYMENT', 'nullable', 'numeric', 'min:0'],
            'exchange_rate' => ['required_if:transaction_type,PAYMENT', 'nullable', 'numeric', 'min:0.0001'],

            // RECEIVE: SAR amount is entered directly.
            'sar_amount' => ['required_if:transaction_type,RECEIVE', 'nullable', 'numeric', 'min:0'],
        ];
    }
}
