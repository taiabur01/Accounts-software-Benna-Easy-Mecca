<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_masters', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_no')->unique();
            $table->date('purchase_date');
            $table->foreignId('agency_id')->constrained('agencies');
            $table->foreignId('g_code_id')->constrained('g_codes');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['agency_id', 'purchase_date']);
            $table->index('g_code_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_masters');
    }
};
