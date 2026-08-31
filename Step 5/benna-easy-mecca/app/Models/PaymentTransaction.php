<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'voucher_no',
        'transaction_date',
        'agency_id',
        'g_code_id',
        'transaction_type',
        'mode_of_payment',
        'bd_amount',
        'exchange_rate',
        'sar_amount',
        'note',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'bd_amount' => 'decimal:2',
        'exchange_rate' => 'decimal:4',
        'sar_amount' => 'decimal:2',
    ];

    // NEW (Step 5): expose allocated_amount / unallocated_amount whenever this model is serialized.
    protected $appends = [
        'allocated_amount',
        'unallocated_amount',
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function gCode()
    {
        return $this->belongsTo(GCode::class);
    }

    // NEW (Step 5): every allocation this payment has been split across
    // (a single payment can be applied to several invoices/purchase bills).
    public function allocations()
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    public function getAllocatedAmountAttribute(): float
    {
        if (array_key_exists('allocations_sum_allocated_amount', $this->attributes)) {
            return (float) $this->attributes['allocations_sum_allocated_amount'];
        }

        return (float) $this->allocations()->sum('allocated_amount');
    }

    public function getUnallocatedAmountAttribute(): float
    {
        return round((float) $this->sar_amount - $this->allocated_amount, 2);
    }
}
