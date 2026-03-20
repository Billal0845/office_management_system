<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManagerReport extends Model
{
    protected $fillable = [
        'hub_id',
        'date',
        'website_orders',
        'legal_orders',
        'duplicate_orders',
        'total_zone_changed',
        'total_sent_to_courier',
        'today_total',
        'sent_to_courier_in_courier_dashboard',
        'total_delivered_order',
        'total_cash_received_from_courier',
        'total_spent_dollar',

        // New Fields
        'total_big_orders',
        'total_small_orders'
    ];

    public function hub()
    {
        return $this->belongsTo(Hub::class);
    }
}
