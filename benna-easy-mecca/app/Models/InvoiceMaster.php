<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InvoiceMaster extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_no',
        'invoice_date',
        'agency_id',
        'g_code_id',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    // NEW (Step 5): expose paid_amount / due_amount whenever this model is serialized to JSON.
    protected $appends = [
        'paid_amount',
        'due_amount',
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function gCode()
    {
        return $this->belongsTo(GCode::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    // NEW (Step 5): all payment allocations applied against this invoice.
    public function allocations()
    {
        return $this->morphMany(PaymentAllocation::class, 'allocatable');
    }

    /**
     * Sum of everything allocated against this invoice so far.
     * NOTE: if this invoice was loaded via ->withSum('allocations as allocations_sum_allocated_amount', 'allocated_amount'),
     * that pre-computed value is reused to avoid an extra query per row.
     */
    public function getPaidAmountAttribute(): float
    {
        if (array_key_exists('allocations_sum_allocated_amount', $this->attributes)) {
            return (float) $this->attributes['allocations_sum_allocated_amount'];
        }

        return (float) $this->allocations()->sum('allocated_amount');
    }

    public function getDueAmountAttribute(): float
    {
        return round((float) $this->total_amount - $this->paid_amount, 2);
    }
}
