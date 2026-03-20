<?php
namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DailyReport;

class ReportController extends Controller
{
    public function today(Request $request)
    {
        $report = DailyReport::where('user_id', $request->user()->id)->where('date', date('Y-m-d'))->first();
        return response()->json(['report' => $report]);
    }

    public function store(Request $request)
    {
        // Time Validation (10 AM to 11 PM)
        // $currentHour = (int) date('H');
        $currentHour = now()->hour;

        if ($currentHour < 10 || $currentHour >= 23) {
            return response()->json(['message' => 'Report submission is only allowed between 10:00 AM and 11:00 PM. (Server time is currently ' . now()->format('h:i A') . ')'], 403);
        }

        $request->validate([
            'received_orders' => 'required|integer|min:0',
            'confirmed_big_orders' => 'required|integer|min:0',
            'confirmed_small_orders' => 'required|integer|min:0',
        ]);

        $received = $request->received_orders;
        $big = $request->confirmed_big_orders;
        $small = $request->confirmed_small_orders;
        $totalConfirmed = $big + $small;

        if ($totalConfirmed > $received) {
            return response()->json(['message' => 'Total confirmed orders cannot exceed received orders.'], 422);
        }

        $cancelled = $received - $totalConfirmed;
        $today = date('Y-m-d');
        $userId = $request->user()->id;

        $report = DailyReport::where('user_id', $userId)->where('date', $today)->first();

        $data = [
            'received_orders' => $received,
            'confirmed_big_orders' => $big,
            'confirmed_small_orders' => $small,
            'total_confirmed' => $totalConfirmed,
            'cancelled_orders' => $cancelled,
        ];

        if ($report) {
            if ($report->update_count >= 1) {
                return response()->json(['message' => 'Maximum limit of 1 update reached.'], 403);
            }
            $report->update(array_merge($data, ['update_count' => $report->update_count + 1]));
            $message = 'Report updated successfully!';
        } else {
            $report = DailyReport::create(array_merge($data, [
                'user_id' => $userId,
                'date' => $today,
                'update_count' => 0
            ]));
            $message = 'Report submitted successfully!';
        }

        return response()->json(['message' => $message, 'report' => $report]);
    }
}