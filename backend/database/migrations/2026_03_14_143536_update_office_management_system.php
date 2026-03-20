<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Employee Profiles: Remove shift, add designation
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropColumn('shift');
            $table->string('designation')->after('photo')->nullable();
        });

        // 2. Attendances: Add zone_changed_orders
        Schema::table('attendances', function (Blueprint $table) {
            $table->integer('zone_changed_orders')->default(0)->after('status');
        });

        // 3. Daily Reports (Employee): Overhaul columns
        Schema::table('daily_reports', function (Blueprint $table) {
            $table->dropColumn(['assigned_orders', 'confirmed_orders', 'zone_changed_orders']);
            $table->integer('received_orders')->default(0)->after('date');
            $table->integer('confirmed_big_orders')->default(0)->after('received_orders');
            $table->integer('confirmed_small_orders')->default(0)->after('confirmed_big_orders');
            $table->integer('total_confirmed')->default(0)->after('confirmed_small_orders');
        });

        // 4. Create Manager Reports Table
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
            $table->timestamps();
        });
    }

    public function down()
    {
        // 1. Employee Profiles: restore shift, remove designation
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropColumn('designation');
            $table->string('shift')->nullable();
        });

        // 2. Attendances: remove zone_changed_orders
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('zone_changed_orders');
        });

        // 3. Daily Reports: restore old columns and remove new ones
        Schema::table('daily_reports', function (Blueprint $table) {
            $table->dropColumn([
                'received_orders',
                'confirmed_big_orders',
                'confirmed_small_orders',
                'total_confirmed'
            ]);

            $table->integer('assigned_orders')->default(0)->after('date');
            $table->integer('confirmed_orders')->default(0)->after('assigned_orders');
            $table->integer('zone_changed_orders')->default(0)->after('confirmed_orders');
        });

        // 4. Drop Manager Reports Table
        Schema::dropIfExists('manager_reports');
    }
};