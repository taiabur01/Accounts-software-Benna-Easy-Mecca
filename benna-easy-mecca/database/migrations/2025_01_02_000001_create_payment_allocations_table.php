<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_transaction_id')
                ->constrained('payment_transactions')
                ->cascadeOnDelete();

            // Polymorphic target: InvoiceMaster (RECEIVE payments) or PurchaseMaster (PAYMENT payments).
            // Laravel's morphs() already adds an index on (allocatable_type, allocatable_id).
            $table->morphs('allocatable');

            // Always stored in SAR, matching invoice_masters.total_amount / purchase_masters.total_amount.
            $table->decimal('allocated_amount', 15, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_allocations');
    }
};
