<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Hub;
use App\Models\EmployeeProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ManagerController extends Controller
{
    public function index()
    {
        // Added 'employeeProfile' to fetch basic_salary for the frontend
        $managers = User::where('role', 'manager')->with(['managedHub', 'employeeProfile'])->get();
        return response()->json($managers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|unique:users',
            'password' => 'required|min:6',
            'hub_id' => 'required|exists:hubs,id',
            'basic_salary' => 'required|numeric|min:0',
            'join_date' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            $manager = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'manager',
                'hub_id' => $request->hub_id,
            ]);

            EmployeeProfile::create([
                'user_id' => $manager->id,
                'basic_salary' => $request->basic_salary,
                'designation' => 'Hub Manager',
                'join_date' => $request->join_date,
            ]);

            $hub = Hub::find($request->hub_id);
            $hub->update(['manager_id' => $manager->id]);

            DB::commit();
            return response()->json(['message' => 'Manager created successfully', 'manager' => $manager], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create manager', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $manager = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'phone' => 'required|unique:users,phone,' . $id,
            'hub_id' => 'required|exists:hubs,id',
            'basic_salary' => 'required|numeric|min:0',
            'join_date' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            // Update Manager details
            $manager->name = $request->name;
            $manager->email = $request->email;
            $manager->phone = $request->phone;
            $manager->hub_id = $request->hub_id;

            if ($request->filled('password')) {
                $manager->password = Hash::make($request->password);
            }
            $manager->save();

            // Update Employee Profile
            EmployeeProfile::updateOrCreate(
                ['user_id' => $manager->id],
                [
                    'basic_salary' => $request->basic_salary,
                    'join_date' => $request->join_date,
                    'designation' => 'Hub Manager'
                ]
            );

            // Update Hub Assignment
            Hub::where('manager_id', $manager->id)->update(['manager_id' => null]); // Remove old assignment
            $newHub = Hub::find($request->hub_id);
            $newHub->update(['manager_id' => $manager->id]);

            DB::commit();
            return response()->json(['message' => 'Manager updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update manager', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $manager = User::findOrFail($id);

        DB::beginTransaction();
        try {
            // Unassign from Hub
            Hub::where('manager_id', $manager->id)->update(['manager_id' => null]);

            // EmployeeProfile is usually cascade-deleted, but we can do it manually if needed
            EmployeeProfile::where('user_id', $manager->id)->delete();

            $manager->delete();

            DB::commit();
            return response()->json(['message' => 'Manager deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete manager', 'error' => $e->getMessage()], 500);
        }
    }
}