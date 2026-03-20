<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\DailyReport;


class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $hub_id = $request->user()->hub_id;
        $today = date('Y-m-d');

        // Attendance stats
        $allUsers = User::whereIn('role', ['employee', 'manager'])->where('hub_id', $hub_id)->with('employeeProfile')->get();
        $presentIds = Attendance::where('hub_id', $hub_id)->where('date', $today)->where('status', 'present')->pluck('user_id')->toArray();

        $absentEmployees = $allUsers->whereNotIn('id', $presentIds)->values();

        // Summing today's Daily Reports for this hub
        $employeeIds = $allUsers->pluck('id');
        $reports = DailyReport::whereIn('user_id', $employeeIds)->where('date', $today);

        $totalZoneChanged = Attendance::where('hub_id', $hub_id)->where('date', $today)->sum('zone_changed_orders');

        return response()->json([
            'total_confirmed' => $reports->sum('total_confirmed'),
            'total_big' => $reports->sum('confirmed_big_orders'),
            'total_small' => $reports->sum('confirmed_small_orders'),
            'total_cancelled' => $reports->sum('cancelled_orders'),
            'total_zone_changed' => $totalZoneChanged,
            'attendance' => [
                'total' => $allUsers->count(),
                'present' => count($presentIds),
                'absent' => $absentEmployees->count(),
                'absent_list' => $absentEmployees
            ]
        ]);
    }
}
