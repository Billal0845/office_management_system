<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Attendance;
use App\Models\DailyReport;
use App\Models\ManagerReport;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Allow Super Admin to pass hub_id in URL, Manager defaults to their own hub
        $user = $request->user();
        $hub_id = $user->role === 'super_admin' ? $request->query('hub_id') : $user->hub_id;

        if (!$hub_id) {
            return response()->json(['message' => 'Hub ID is required'], 400);
        }

        $today = date('Y-m-d');

        $allEmployees = User::whereIn('role', ['employee', 'manager'])
            ->where('hub_id', $hub_id)
            ->with('employeeProfile')
            ->get();

        $presentIds = Attendance::where('hub_id', $hub_id)
            ->where('date', $today)
            ->where('status', 'present')
            ->pluck('user_id')
            ->toArray();

        $absentEmployees = $allEmployees->whereNotIn('id', $presentIds)->values();

        $employeeIds = $allEmployees->pluck('id');
        $reports = DailyReport::whereIn('user_id', $employeeIds)
            ->where('date', $today)
            ->get();

        $totalZoneChanged = Attendance::where('hub_id', $hub_id)
            ->where('date', $today)
            ->sum('zone_changed_orders');

        $managerReport = ManagerReport::where('hub_id', $hub_id)->where('date', $today)->first();

        return response()->json([
            'kpis' => [
                'total_confirmed' => $reports->sum('total_confirmed'),
                'total_big' => $reports->sum('confirmed_big_orders'),
                'total_small' => $reports->sum('confirmed_small_orders'),
                'total_cancelled' => $reports->sum('cancelled_orders'),
                'total_zone_changed' => $totalZoneChanged,
            ],
            'attendance' => [
                'total' => $allEmployees->count(),
                'present' => count($presentIds),
                'absent' => $absentEmployees->count(),
                'absent_list' => $absentEmployees
            ],
            'manager_report' => $managerReport
        ]);
    }

    public function storeReport(Request $request)
    {
        $request->validate([
            'website_orders' => 'required|integer|min:0',
            'legal_orders' => 'required|integer|min:0',
            'sent_to_courier_in_courier_dashboard' => 'required|integer|min:0',
            'total_delivered_order' => 'required|integer|min:0',
            'total_cash_received_from_courier' => 'required|numeric|min:0',
            'total_spent_dollar' => 'required|numeric|min:0'
        ]);

        if ($request->legal_orders > $request->website_orders) {
            return response()->json(['message' => 'Legal orders cannot be greater than Website orders.'], 422);
        }

        $user = $request->user();
        $hub_id = $user->role === 'super_admin' ? $request->hub_id : $user->hub_id;
        $today = date('Y-m-d');

        // Fetch Live Calculations to auto-save
        $totalZoneChanged = Attendance::where('hub_id', $hub_id)->where('date', $today)->sum('zone_changed_orders');

        $employeeIds = User::whereIn('role', ['employee', 'manager'])->where('hub_id', $hub_id)->pluck('id');
        $reports = DailyReport::whereIn('user_id', $employeeIds)->where('date', $today)
            ->selectRaw('SUM(total_confirmed) as total_confirmed, SUM(confirmed_big_orders) as total_big, SUM(confirmed_small_orders) as total_small')
            ->first();

        $totalConfirmed = $reports->total_confirmed ?? 0;
        $totalSentToCourier = $totalConfirmed - $totalZoneChanged;
        $duplicate = $request->website_orders - $request->legal_orders;

        $report = ManagerReport::updateOrCreate(
            ['hub_id' => $hub_id, 'date' => $today],
            [
                'website_orders' => $request->website_orders,
                'legal_orders' => $request->legal_orders,
                'duplicate_orders' => $duplicate,
                'sent_to_courier_in_courier_dashboard' => $request->sent_to_courier_in_courier_dashboard,
                'total_delivered_order' => $request->total_delivered_order,
                'total_cash_received_from_courier' => $request->total_cash_received_from_courier,
                'total_spent_dollar' => $request->total_spent_dollar,
                'total_zone_changed' => $totalZoneChanged,
                'today_total' => $totalConfirmed,
                'total_sent_to_courier' => $totalSentToCourier,
                'total_big_orders' => $reports->total_big ?? 0,
                'total_small_orders' => $reports->total_small ?? 0,
            ]
        );

        return response()->json(['message' => 'Report saved successfully!', 'report' => $report]);
    }
}