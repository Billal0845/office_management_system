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
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('address')->nullable(); // Village, Union, Upazila, Zila
            $table->string('nid_number')->nullable();
            $table->string('photo')->nullable();
            $table->string('expert_in')->nullable();
            $table->enum('employment_type', ['full_time', 'part_time'])->default('full_time');
            $table->enum('shift', ['day', 'night'])->default('day');
            $table->decimal('basic_salary', 10, 2);
            $table->date('join_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};
