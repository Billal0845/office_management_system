<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('month', 2); // e.g., "02"
            $table->string('year', 4);  // e.g., "2025"
            $table->decimal('basic_salary', 10, 2);
            $table->integer('days_in_month');
            $table->decimal('daily_wage', 10, 2);
            $table->integer('total_days_worked');
            $table->decimal('pay_for_salary', 10, 2); // basic * (total_worked / days_in_month)
            $table->decimal('awards', 10, 2)->default(0);
            $table->decimal('advance_taken', 10, 2)->default(0);
            $table->decimal('payment_done', 10, 2)->default(0);
            $table->decimal('next_pay', 10, 2)->default(0); // Carry forward balance
            $table->timestamps();

            $table->unique(['user_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};
