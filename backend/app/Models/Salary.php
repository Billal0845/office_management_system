<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    protected $fillable = [
        'user_id',
        'month',
        'year',
        'basic_salary',
        'days_in_month',
        'daily_wage',
        'present_days',
        'absent_days',
        'total_days_worked',
        'pay_for_salary',
        'previous_due',
        'awards',
        'advance_taken',
        'total_payable',
        'payment_done',
        'next_pay'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}