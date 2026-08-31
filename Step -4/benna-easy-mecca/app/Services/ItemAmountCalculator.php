<?php

namespace App\Services;

class ItemAmountCalculator
{
    /** Items priced as PAX * Rate */
    protected const PAX_RATE_TYPES = ['UMRAH VISA', 'BRN CHARGE', 'MULTIPLE VISA'];

    /** Items priced as a fixed, directly-entered sale amount */
    protected const FIXED_AMOUNT_TYPES = ['TRANSPORT', 'NAQABA-FINE', 'ESCAPED FINE TO'];

    /**
     * Calculate the line amount for one invoice/purchase item based on its
     * type and the dynamic `details` payload submitted from the frontend.
     */
    public static function calculate(string $itemType, array $details): float
    {
        if ($itemType === 'HOTEL') {
            $nights = (float) ($details['nights'] ?? 0);
            $rooms = (float) ($details['rooms'] ?? 0);
            $rate = (float) ($details['rate'] ?? 0);

            return round($nights * $rooms * $rate, 2);
        }

        if (in_array($itemType, self::PAX_RATE_TYPES, true)) {
            $pax = (float) ($details['pax'] ?? 0);
            $rate = (float) ($details['rate'] ?? 0);

            return round($pax * $rate, 2);
        }

        if (in_array($itemType, self::FIXED_AMOUNT_TYPES, true)) {
            return round((float) ($details['sale_amount'] ?? 0), 2);
        }

        return 0.0;
    }
}
