import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import DashboardLayout from "./components/Layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Hubs from "./pages/admin/Hubs";
import Managers from "./pages/admin/Managers";

// Manager Pages
import Employees from "./pages/manager/Employees";
import Attendance from "./pages/manager/Attendance";
import ManagerDashboard from "./pages/manager/Dashboard";

// Employee Pages
import DailyReport from "./pages/employee/DailyReport";

// Shared Pages (Admin & Manager)
import Salaries from "./pages/shared/Salaries";

// Temporary Employee Dashboard
const EmployeeDashboard = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold dark:text-white">
      Employee Dashboard Content
    </h2>
    <p className="text-gray-500 dark:text-gray-400 mt-2">
      Welcome to your workspace. Use the sidebar to submit your Daily Report.
    </p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-gray-100 transition-colors duration-300 font-poppins">
        <Router>
          <AuthProvider>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />

              {/* ================= SUPER ADMIN ROUTES ================= */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/hubs"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <DashboardLayout>
                      <Hubs />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/managers"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <DashboardLayout>
                      <Managers />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/salaries"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <DashboardLayout>
                      <Salaries />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* ================= MANAGER ROUTES ================= */}
              <Route
                path="/manager"
                element={
                  <ProtectedRoute allowedRoles={["manager", "super_admin"]}>
                    <DashboardLayout>
                      <ManagerDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manager/employees"
                element={
                  <ProtectedRoute allowedRoles={["manager", "super_admin"]}>
                    <DashboardLayout>
                      <Employees />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manager/attendance"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <DashboardLayout>
                      <Attendance />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manager/salaries"
                element={
                  <ProtectedRoute allowedRoles={["manager", "super_admin"]}>
                    <DashboardLayout>
                      <Salaries />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* ================= EMPLOYEE ROUTES ================= */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["employee"]}>
                    <DashboardLayout>
                      <EmployeeDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employee/daily-report"
                element={
                  <ProtectedRoute allowedRoles={["employee"]}>
                    <DashboardLayout>
                      <DailyReport />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback redirect for /employee */}
              <Route
                path="/employee"
                element={<Navigate to="/employee/dashboard" replace />}
              />
            </Routes>
          </AuthProvider>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
