<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'hub_id',
        'date',
        'status',
        'zone_changed_orders',
        'is_friday',
        'marked_by'
    ];
}
