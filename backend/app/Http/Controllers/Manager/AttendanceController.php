<?php
namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\User;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $today = date('Y-m-d');
        $hub_id = $request->user()->hub_id;

        // Fetch BOTH employees AND the manager for this hub
        $employees = User::whereIn('role', ['employee', 'manager'])
            ->where('hub_id', $hub_id)
            ->with('employeeProfile')
            ->get();

        $attendances = Attendance::where('hub_id', $hub_id)
            ->where('date', $today)
            ->get()->keyBy('user_id');

        $employees->map(function ($employee) use ($attendances) {
            $record = $attendances->get($employee->id);
            $employee->today_attendance = $record ? $record->status : 'absent';
            $employee->zone_changed_orders = $record ? $record->zone_changed_orders : 0;
            return $employee;
        });

        return response()->json(['date' => $today, 'employees' => $employees]);
    }

    public function markAttendance(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|in:present,absent',
            'zone_changed_orders' => 'nullable|integer'
        ]);

        $today = date('Y-m-d');

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $request->user_id, 'date' => $today],
            [
                'hub_id' => $request->user()->hub_id,
                'status' => $request->status,


                'zone_changed_orders' => $request->zone_changed_orders,
                'is_friday' => (date('l') == 'Friday'),
                'marked_by' => $request->user()->id
            ]
        );

        return response()->json(['message' => 'Attendance updated', 'attendance' => $attendance]);
    }
}