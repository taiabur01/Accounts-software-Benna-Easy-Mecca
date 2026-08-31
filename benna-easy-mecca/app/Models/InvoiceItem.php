<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_master_id',
        'item_type',
        'details',
        'note',
        'amount',
    ];

    protected $casts = [
        'details' => 'array',
        'amount' => 'decimal:2',
    ];

    public function invoiceMaster()
    {
        return $this->belongsTo(InvoiceMaster::class);
    }
}
