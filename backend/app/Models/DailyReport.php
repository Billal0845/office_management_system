<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyReport extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'received_orders',
        'confirmed_big_orders',
        'confirmed_small_orders',
        'total_confirmed',
        'cancelled_orders',
        'update_count'
    ];
}
