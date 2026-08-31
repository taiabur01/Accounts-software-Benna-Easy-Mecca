<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_transaction_id',
        'allocatable_id',
        'allocatable_type',
        'allocated_amount',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
    ];

    public function paymentTransaction()
    {
        return $this->belongsTo(PaymentTransaction::class);
    }

    /**
     * Resolves to either InvoiceMaster or PurchaseMaster depending on allocatable_type.
     */
    public function allocatable()
    {
        return $this->morphTo();
    }
}
