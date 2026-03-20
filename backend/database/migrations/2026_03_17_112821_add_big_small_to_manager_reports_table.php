<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('manager_reports', function (Blueprint $table) {
            $table->integer('total_big_orders')->default(0)->after('today_total');
            $table->integer('total_small_orders')->default(0)->after('total_big_orders');
        });
    }

    public function down()
    {
        Schema::table('manager_reports', function (Blueprint $table) {
            $table->dropColumn(['total_big_orders', 'total_small_orders']);
        });
    }
};