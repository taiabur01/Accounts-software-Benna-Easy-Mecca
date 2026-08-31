<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_master_id',
        'item_type',
        'details',
        'note',
        'amount',
    ];

    protected $casts = [
        'details' => 'array',
        'amount' => 'decimal:2',
    ];

    public function purchaseMaster()
    {
        return $this->belongsTo(PurchaseMaster::class);
    }
}
