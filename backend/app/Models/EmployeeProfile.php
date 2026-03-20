<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'address',
        'nid_number',
        'photo',
        'expert_in',
        'employment_type',
        'designation',
        'basic_salary',
        'join_date'
    ];
}