<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentNumberSequence extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_type',
        'financial_year',
        'last_number',
    ];
}
