import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Header() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Get user and logout function from our AuthContext
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <header className="dark:bg-slate-950 dark:border-b dark:border-gray-700 font-poppins bg-white shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center">
            <h1 className="text-2xl pl-3 font-bold  text-gray-800 dark:text-gray-300">
              Dash<span className="text-blue-600">board</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 capitalize">
              As {user?.role?.replace("_", " ")}
            </span>

            {/* Profile Icon */}
            <div
              title="Click to Open"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-10 h-10 hover:cursor-pointer rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold select-none"
            >
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className="">
          {profileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-9998"
                onClick={() => setProfileMenuOpen(false)}
              ></div>

              <div className="absolute border border-gray-200 dark:border-gray-600 right-4 top-16 bg-white dark:bg-gray-800 shadow-xl rounded-md w-48 py-2 z-9999">
                <div className="px-4 py-2 border-b dark:border-gray-700 mb-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}

export default Header;
