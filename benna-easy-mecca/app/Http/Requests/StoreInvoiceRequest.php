<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_date' => ['required', 'date'],
            'g_code_id' => ['required', 'exists:g_codes,id'],
            'notes' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.item_type' => [
                'required',
                'in:UMRAH VISA,BRN CHARGE,TRANSPORT,NAQABA-FINE,ESCAPED FINE TO,HOTEL,MULTIPLE VISA',
            ],
            'items.*.note' => ['nullable', 'string'],
            'items.*.details' => ['required', 'array'],

            // PAX * Rate items
            'items.*.details.pax' => [
                'required_if:items.*.item_type,UMRAH VISA,BRN CHARGE,MULTIPLE VISA',
                'numeric', 'min:0',
            ],
            'items.*.details.rate' => [
                'required_if:items.*.item_type,UMRAH VISA,BRN CHARGE,MULTIPLE VISA,HOTEL',
                'numeric', 'min:0',
            ],

            // HOTEL: Nights * Rooms * Rate
            'items.*.details.nights' => ['required_if:items.*.item_type,HOTEL', 'numeric', 'min:0'],
            'items.*.details.rooms' => ['required_if:items.*.item_type,HOTEL', 'numeric', 'min:0'],

            // Fixed-amount items
            'items.*.details.sale_amount' => [
                'required_if:items.*.item_type,TRANSPORT,NAQABA-FINE,ESCAPED FINE TO',
                'numeric', 'min:0',
            ],
        ];
    }
}
