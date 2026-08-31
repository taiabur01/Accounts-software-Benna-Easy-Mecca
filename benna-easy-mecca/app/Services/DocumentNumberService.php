<?php

namespace App\Services;

use App\Models\DocumentNumberSequence;
use Illuminate\Support\Facades\DB;

class DocumentNumberService
{
    /**
     * Generate the next sequential document number for a given type
     * (e.g. INV, PUR, VOU) and financial year, resetting per year.
     * Uses a row lock so concurrent requests never collide.
     */
    public static function next(string $documentType, string $financialYear): string
    {
        return DB::transaction(function () use ($documentType, $financialYear) {
            $sequence = DocumentNumberSequence::where('document_type', $documentType)
                ->where('financial_year', $financialYear)
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                $sequence = DocumentNumberSequence::create([
                    'document_type' => $documentType,
                    'financial_year' => $financialYear,
                    'last_number' => 0,
                ]);

                // Re-fetch with a lock in case of a concurrent first-insert race.
                $sequence = DocumentNumberSequence::where('id', $sequence->id)
                    ->lockForUpdate()
                    ->first();
            }

            $nextNumber = $sequence->last_number + 1;
            $sequence->update(['last_number' => $nextNumber]);

            $padded = str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);

            return "{$documentType}-{$financialYear}-{$padded}";
        });
    }
}
