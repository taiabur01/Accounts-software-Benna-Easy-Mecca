<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'agency_id',
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
}
