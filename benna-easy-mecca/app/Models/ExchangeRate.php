<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'rate_date',
        'rate',
    ];

    protected $casts = [
        'rate_date' => 'date',
        'rate' => 'decimal:4',
    ];
}
