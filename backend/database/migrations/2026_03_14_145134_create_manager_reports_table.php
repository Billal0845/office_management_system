<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('manager_reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('hub_id')->constrained()->cascadeOnDelete();

            $table->date('date');

            $table->integer('website_orders')->default(0);
            $table->integer('legal_orders')->default(0);
            $table->integer('duplicate_orders')->default(0);
            $table->integer('total_zone_changed')->default(0);
            $table->integer('total_sent_to_courier')->default(0);
            $table->integer('today_total')->default(0);

            $table->integer('sent_to_courier_in_courier_dashboard')->default(0);
            $table->integer('total_delivered_order')->default(0);

            $table->decimal('total_cash_received_from_courier', 10, 2)->default(0);
            $table->decimal('total_spent_dollar', 10, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manager_reports');
    }
};
