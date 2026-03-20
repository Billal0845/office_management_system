import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Moon,
  Sun,
  Menu,
  X,
  Home,
  Users,
  CheckSquare,
  ClipboardList,
  UserCog,
  Banknote, // <-- Added the Banknote icon for Salaries
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

function Sidebar({ collapsed, setCollapsed, darkMode, toggleDarkMode }) {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Dynamic Navigation Links based on Roles
  const navLinks = [];

  if (user?.role === "super_admin") {
    navLinks.push(
      { title: "Dashboard", path: "/admin", icon: <Home size={20} /> },
      { title: "Manage Hubs", path: "/admin/hubs", icon: <Users size={20} /> },
      {
        title: "Manage Managers",
        path: "/admin/managers",
        icon: <UserCog size={20} />,
      },
      // --- ADDED SALARY FOR SUPER ADMIN ---
      {
        title: "Salary Management",
        path: "/admin/salaries",
        icon: <Banknote size={20} />,
      },
    );
  } else if (user?.role === "manager") {
    navLinks.push(
      { title: "Dashboard", path: "/manager", icon: <Home size={20} /> },
      {
        title: "Employees",
        path: "/manager/employees",
        icon: <Users size={20} />,
      },
      {
        title: "Mark Attendance",
        path: "/manager/attendance",
        icon: <CheckSquare size={20} />,
      },
      // --- ADDED SALARY FOR MANAGER ---
      {
        title: "Salary Sheet",
        path: "/manager/salaries",
        icon: <Banknote size={20} />,
      },
    );
  } else if (user?.role === "employee") {
    navLinks.push(
      { title: "Dashboard", path: "/employee", icon: <Home size={20} /> },
      {
        title: "Daily Report",
        path: "/employee/daily-report",
        icon: <ClipboardList size={20} />,
      },
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
                group fixed sm:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-gray-800 
                transform transition-all duration-300 ease-in-out flex flex-col flex-shrink-0
                ${collapsed ? "-translate-x-full sm:translate-x-0 sm:w-20 sm:hover:w-64" : "translate-x-0 w-64"}
            `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
          <span
            className={`font-bold text-xl text-gray-800 dark:text-white transition-all duration-300 whitespace-nowrap ${
              collapsed
                ? "sm:opacity-0 sm:-translate-x-8 sm:group-hover:opacity-100 sm:group-hover:translate-x-0"
                : "opacity-100"
            }`}
          >
            OM<span className="text-blue-600">System</span>
          </span>

          {/* Mobile Close Button */}
          <button
            onClick={() => setCollapsed(true)}
            className="sm:hidden text-gray-500 hover:text-gray-800 dark:hover:text-white flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={index}>
                  <Link
                    to={link.path}
                    onClick={() =>
                      window.innerWidth < 640 && setCollapsed(true)
                    }
                    className={`
                                            flex items-center p-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap
                                            ${
                                              isActive
                                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                                            }
                                        `}
                  >
                    <span className="flex-shrink-0">{link.icon}</span>
                    <span
                      className={`ml-3 transition-all duration-300 ${
                        collapsed
                          ? "sm:opacity-0 sm:-translate-x-8 sm:group-hover:opacity-100 sm:group-hover:translate-x-0"
                          : "opacity-100"
                      }`}
                    >
                      {link.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / Theme Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={toggleDarkMode}
            className={`
                            flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-400 
                            hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors overflow-hidden whitespace-nowrap
                        `}
          >
            <span className="flex-shrink-0">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </span>
            <span
              className={`ml-3 transition-all duration-300 ${
                collapsed
                  ? "sm:opacity-0 sm:-translate-x-8 sm:group-hover:opacity-100 sm:group-hover:translate-x-0"
                  : "opacity-100"
              }`}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle Button (Visible only on mobile when sidebar is collapsed) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="sm:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
        >
          <Menu size={24} />
        </button>
      )}
    </>
  );
}

export default Sidebar;
