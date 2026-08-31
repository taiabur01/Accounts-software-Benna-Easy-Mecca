<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agency extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agency_name',
        'agency_type',
        'contact_person',
        'phone',
        'address',
        'opening_balance',
        'opening_balance_type',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
    ];

    public function gCodes()
    {
        return $this->hasMany(GCode::class);
    }

    public function invoiceMasters()
    {
        return $this->hasMany(InvoiceMaster::class);
    }

    public function purchaseMasters()
    {
        return $this->hasMany(PurchaseMaster::class);
    }

    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
