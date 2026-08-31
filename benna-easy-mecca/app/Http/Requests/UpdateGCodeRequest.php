<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $gCode = $this->route('g_code') ?? $this->route('gCode');

        return [
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('g_codes', 'code')->ignore($gCode?->id),
            ],
            'agency_id' => ['sometimes', 'required', 'exists:agencies,id'],
        ];
    }
}
