<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ManagerReport;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function getKpis(Request $request)
    {
        $filter = $request->query('filter', 'today'); // 'today', 'month', 'all', 'custom'
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = ManagerReport::query();

        // Apply Date Filters
        if ($filter === 'today') {
            $query->whereDate('date', Carbon::today());
        } elseif ($filter === 'month') {
            $query->whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year);
        } elseif ($filter === 'custom' && $startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }
        // if 'all', it skips the where clause and sums everything

        $kpis = [
            'total_confirm_orders' => (int) $query->sum('today_total'),
            'total_zone_changed' => (int) $query->sum('total_zone_changed'),
            'total_sent_to_courier' => (int) $query->sum('total_sent_to_courier'),
            'total_delivery' => (int) $query->sum('total_delivered_order'),
            'total_cash_received' => (float) $query->sum('total_cash_received_from_courier'),
            'total_spent_dollar' => (float) $query->sum('total_spent_dollar'),
        ];

        return response()->json($kpis);
    }
}