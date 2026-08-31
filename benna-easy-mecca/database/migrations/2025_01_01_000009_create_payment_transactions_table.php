<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('voucher_no')->unique();
            $table->date('transaction_date');
            $table->foreignId('agency_id')->constrained('agencies');
            $table->foreignId('g_code_id')->constrained('g_codes');
            $table->enum('transaction_type', ['RECEIVE', 'PAYMENT']);
            $table->string('mode_of_payment'); // Cash, Bank Transfer, ATM
            $table->decimal('bd_amount', 15, 2)->nullable();
            $table->decimal('exchange_rate', 10, 4)->nullable();
            $table->decimal('sar_amount', 15, 2);
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['agency_id', 'transaction_date']);
            $table->index('g_code_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
