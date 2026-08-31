<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_number_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('document_type'); // INV, PUR, VOU
            $table->string('financial_year'); // e.g. 2026
            $table->unsignedBigInteger('last_number')->default(0);
            $table->timestamps();

            $table->unique(['document_type', 'financial_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_number_sequences');
    }
};
