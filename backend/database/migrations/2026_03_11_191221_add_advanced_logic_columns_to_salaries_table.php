<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('salaries', function (Blueprint $table) {
            $table->integer('present_days')->default(0)->after('daily_wage');
            $table->integer('absent_days')->default(0)->after('present_days');
            $table->decimal('previous_due', 10, 2)->default(0)->after('pay_for_salary');
            $table->decimal('total_payable', 10, 2)->default(0)->after('advance_taken');
        });
    }

    public function down(): void
    {
        Schema::table('salaries', function (Blueprint $table) {
            $table->dropColumn(['present_days', 'absent_days', 'previous_due', 'total_payable']);
        });
    }
};