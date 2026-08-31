<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_master_id')->constrained('purchase_masters')->cascadeOnDelete();
            $table->enum('item_type', [
                'UMRAH VISA', 'BRN CHARGE', 'TRANSPORT', 'NAQABA-FINE',
                'ESCAPED FINE TO', 'HOTEL', 'MULTIPLE VISA',
            ]);
            $table->json('details')->nullable();
            $table->text('note')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
