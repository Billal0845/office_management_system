import React, { useState, useContext } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";
import { ThemeContext } from "../../context/ThemeContext";

function DashboardLayout({ children }) {
  // Mobile sidebar state
  const [collapsed, setCollapsed] = useState(true);

  // Consume global theme from Context
  const { theme, toggleTheme } = useContext(ThemeContext);
  const darkMode = theme === "dark";

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden font-poppins">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        darkMode={darkMode}
        toggleDarkMode={toggleTheme}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-slate-900 transition-all duration-300">
        {/* Mobile hamburger menu trigger is inside Sidebar or Header usually, 
                    we will handle mobile toggle via a floating button in Sidebar for now */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 transition-colors duration-300">
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
