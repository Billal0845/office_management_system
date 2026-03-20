import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. Show a professional loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2
          className="animate-spin text-blue-600 dark:text-blue-400 mb-4"
          size={48}
        />
        <p className="text-gray-600 dark:text-gray-400 font-poppins">
          Loading your workspace...
        </p>
      </div>
    );
  }

  // 2. If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If a specific role is required and the user doesn't have it, redirect them to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "super_admin") return <Navigate to="/admin" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    if (user.role === "employee") return <Navigate to="/employee" replace />;
  }

  // 4. If everything is fine, render the requested component
  return children;
};

export default ProtectedRoute;
