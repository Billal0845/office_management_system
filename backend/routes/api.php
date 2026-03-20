<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\HubController;
use App\Http\Controllers\Admin\ManagerController;
use App\Http\Controllers\Employee\ReportController;
use App\Http\Controllers\Manager\EmployeeController;
use App\Http\Controllers\Manager\AttendanceController;
use App\Http\Controllers\Shared\SalaryController;
use App\Http\Controllers\Manager\DashboardController;
use App\Http\Controllers\Admin\AdminDashboardController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Illuminate\Http\Request $request) {
        return $request->user();
    });

    // --- SUPER ADMIN ROUTES ---
    Route::middleware('role:super_admin')->prefix('admin')->group(function () {
        // Hubs (Added update and destroy)
        Route::get('/hubs', [HubController::class, 'index']);
        Route::post('/hubs', [HubController::class, 'store']);
        Route::put('/hubs/{id}', [HubController::class, 'update']);
        Route::delete('/hubs/{id}', [HubController::class, 'destroy']);

        // Managers
        Route::get('/managers', [ManagerController::class, 'index']);
        Route::post('/managers', [ManagerController::class, 'store']);
        Route::put('/managers/{id}', [ManagerController::class, 'update']);
        Route::delete('/managers/{id}', [ManagerController::class, 'destroy']);

        Route::get('/dashboard/kpis', [AdminDashboardController::class, 'getKpis']);
    });

    // --- MANAGER ONLY ROUTES ---
    Route::middleware('role:manager')->prefix('manager')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::post('/attendance', [AttendanceController::class, 'markAttendance']);
        Route::get('/attendance', [AttendanceController::class, 'index']);
    });

    // --- EMPLOYEE ONLY ROUTES ---
    Route::middleware('role:employee')->prefix('employee')->group(function () {
        Route::get('/daily-report/today', [ReportController::class, 'today']);
        Route::post('/daily-report', [ReportController::class, 'store']);
    });

    // --- SHARED ROUTES (SUPER ADMIN & MANAGER) ---
    Route::middleware('role:super_admin,manager')->group(function () {
        // Salaries
        Route::get('/salaries', [SalaryController::class, 'index']);
        Route::patch('/salaries/{id}', [SalaryController::class, 'update']);

        // Dashboard (Moved here so Super Admin can view specific hubs)
        Route::get('/manager/dashboard', [DashboardController::class, 'index']);
        Route::post('/manager/dashboard/report', [DashboardController::class, 'storeReport']);
    });
});