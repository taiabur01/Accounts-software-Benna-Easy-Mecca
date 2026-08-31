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

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function gCode()
    {
        return $this->belongsTo(GCode::class);
    }
}
