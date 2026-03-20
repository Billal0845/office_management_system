<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hub;
use App\Models\User;
use App\Models\DailyReport;
use App\Models\Attendance;
use App\Models\ManagerReport;
use Illuminate\Http\Request;

class HubController extends Controller
{
    public function index()
    {
        $today = date('Y-m-d');
        $hubs = Hub::with('manager:id,name,email,phone')->get();

        foreach ($hubs as $hub) {
            // Get all employee IDs in this hub
            $employeeIds = User::whereIn('role', ['employee', 'manager'])
                ->where('hub_id', $hub->id)
                ->pluck('id');

            // 1. Live Sum of Daily Reports
            $reports = DailyReport::whereIn('user_id', $employeeIds)
                ->where('date', $today)
                ->selectRaw('SUM(total_confirmed) as total_confirmed, SUM(confirmed_big_orders) as total_big, SUM(confirmed_small_orders) as total_small')
                ->first();

            // 2. Live Sum of Attendance Zone Changed
            $zoneChanged = Attendance::where('hub_id', $hub->id)
                ->where('date', $today)
                ->sum('zone_changed_orders');

            // 3. Manual Manager Report Data (if submitted today)
            $managerReport = ManagerReport::where('hub_id', $hub->id)->where('date', $today)->first();

            $totalConfirmed = (int) ($reports->total_confirmed ?? 0);

            // Attach dynamic stats to the hub object
            $hub->today_stats = [
                'total_confirmed' => $totalConfirmed,
                'total_big' => (int) ($reports->total_big ?? 0),
                'total_small' => (int) ($reports->total_small ?? 0),
                'total_zone_changed' => (int) $zoneChanged,
                'total_delivered' => $managerReport ? $managerReport->total_delivered_order : 0,
                'sent_to_courier' => $totalConfirmed - $zoneChanged,
            ];
        }

        return response()->json($hubs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string',
        ]);

        $hub = Hub::create($request->only('name', 'location'));
        return response()->json(['message' => 'Hub created successfully', 'hub' => $hub], 201);
    }

    public function update(Request $request, $id)
    {
        $hub = Hub::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string',
        ]);

        $hub->update($request->only('name', 'location'));
        return response()->json(['message' => 'Hub updated successfully', 'hub' => $hub]);
    }

    public function destroy($id)
    {
        $hub = Hub::findOrFail($id);
        $hub->delete();
        return response()->json(['message' => 'Hub deleted successfully']);
    }
}