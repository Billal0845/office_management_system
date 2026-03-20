<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Salary;
use App\Models\Attendance;
use Carbon\Carbon;

class SalaryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'month' => 'required|string|size:2', // e.g., "03"
            'year' => 'required|string|size:4',  // e.g., "2026"
            'hub_id' => 'required|exists:hubs,id'
        ]);

        $month = $request->month;
        $year = $request->year;
        $hub_id = $request->hub_id;

        if ($request->user()->role === 'manager') {
            $hub_id = $request->user()->hub_id;
        }

        $employees = User::whereIn('role', ['employee', 'manager'])
            ->where('hub_id', $hub_id)
            ->with('employeeProfile')
            ->get();

        $salaries = [];

        foreach ($employees as $employee) {

            // 1. Live calculation of Attendance & Base Financials
            $presentDays = Attendance::where('user_id', $employee->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->where('status', 'present')
                ->count();

            $absentDays = max(0, 26 - $presentDays);
            $paidDays = $presentDays + 4;

            $basicSalary = $employee->employeeProfile->basic_salary ?? 0;
            $dailyWage = $basicSalary > 0 ? ($basicSalary / 30) : 0;
            $payForSalary = $paidDays * $dailyWage; // Earned Salary

            // 2. Previous Month Due
            $prevDate = Carbon::create($year, $month, 1)->subMonth();
            $prevSalary = Salary::where('user_id', $employee->id)
                ->where('month', $prevDate->format('m'))
                ->where('year', $prevDate->format('Y'))
                ->first();
            $previousDue = $prevSalary ? $prevSalary->next_pay : 0;

            // 3. Find existing record OR create a new instance
            $salary = Salary::firstOrNew([
                'user_id' => $employee->id,
                'month' => $month,
                'year' => $year,
            ]);

            // 4. Update the record with fresh LIVE data
            $salary->basic_salary = $basicSalary;
            $salary->days_in_month = Carbon::create($year, $month)->daysInMonth;
            $salary->daily_wage = $dailyWage;
            $salary->present_days = $presentDays;
            $salary->absent_days = $absentDays;
            $salary->total_days_worked = $paidDays;
            $salary->pay_for_salary = $payForSalary;
            $salary->previous_due = $previousDue;

            // Ensure manual fields default to 0 if it's a brand-new record
            if (!$salary->exists) {
                $salary->awards = 0;
                $salary->advance_taken = 0;
                $salary->payment_done = 0;
            }

            // 5. Recalculate Final Totals LIVE
            $totalPayable = $payForSalary + $previousDue + $salary->awards - $salary->advance_taken;
            $salary->total_payable = $totalPayable;
            $salary->next_pay = $totalPayable - $salary->payment_done;

            // 6. Save the refreshed data to the database
            $salary->save();

            // Append frontend-only data
            $salary->employee_name = $employee->name;
            $salary->join_date = $employee->employeeProfile->join_date ?? 'N/A';
            $salary->designation = $employee->employeeProfile->designation ?? 'Staff';
            $salaries[] = $salary;
        }

        return response()->json($salaries);
    }

    public function update(Request $request, $id)
    {
        $salary = Salary::findOrFail($id);

        $request->validate([
            'awards' => 'numeric',
            'advance_taken' => 'numeric',
            'payment_done' => 'numeric'
        ]);

        $awards = $request->input('awards', $salary->awards);
        $advance = $request->input('advance_taken', $salary->advance_taken);
        $payment = $request->input('payment_done', $salary->payment_done);

        // Calculate Totals Live
        $totalPayable = $salary->pay_for_salary + $salary->previous_due + $awards - $advance;
        $nextPay = $totalPayable - $payment;

        $salary->update([
            'awards' => $awards,
            'advance_taken' => $advance,
            'payment_done' => $payment,
            'total_payable' => $totalPayable,
            'next_pay' => $nextPay
        ]);

        return response()->json(['message' => 'Updated successfully', 'salary' => $salary]);
    }
}