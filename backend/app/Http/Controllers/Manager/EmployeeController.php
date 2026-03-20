<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmployeeProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{

    public function index(Request $request)
    {
        // Fetch only the employees belonging to this manager's hub
        $employees = User::where('role', 'employee')
            ->where('hub_id', $request->user()->hub_id)
            ->with('employeeProfile')
            ->get();

        return response()->json($employees);
    }
    public function store(Request $request)
    {
        // 1. Validate all the required data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => ['required', 'unique:users', 'regex:/^(?:\+?88)?01[3-9]\d{8}$/'],
            'password' => 'required|min:6',
            'address' => 'required|string',
            'nid_number' => 'required|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB Image
            'expert_in' => 'nullable|string',
            'employment_type' => 'required|in:full_time,part_time',
            'designation' => 'required|string',
            'basic_salary' => 'required|numeric',
            'join_date' => 'required|date',
        ]);

        DB::beginTransaction();
        try {

            $photoPath = null;
            if ($request->hasFile('photo')) {
                // Kothai:Saves the image to storage/app/public/employee_photos
                $photoPath = $request->file('photo')->store('employee_photos', 'public');
            }

            // 3. Create the Base User (Employee)
            $employee = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'employee',
                // Automatically assign them to the Manager's Hub
                'hub_id' => $request->user()->hub_id,
            ]);

            // 4. Create the Employee Profile with Extra Details
            EmployeeProfile::create([
                'user_id' => $employee->id,
                'address' => $request->address,
                'nid_number' => $request->nid_number,
                'photo' => $photoPath,
                'expert_in' => $request->expert_in,
                'employment_type' => $request->employment_type,
                'designation' => $request->designation,
                'basic_salary' => $request->basic_salary,
                'join_date' => $request->join_date,
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Employee registered successfully!',
                'employee' => $employee->load('employeeProfile')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to register employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}