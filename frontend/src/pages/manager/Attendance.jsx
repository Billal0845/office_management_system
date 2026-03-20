import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import { Calendar, Loader2 } from "lucide-react";

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [todayDate, setTodayDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Tracks which row is loading

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get("/manager/attendance");
      setEmployees(response.data.employees);
      setTodayDate(response.data.date);
    } catch (error) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Accepts explicit newStatus instead of always flipping it
  const handleUpdateAttendance = async (userId, newStatus, zoneChanged) => {
    setProcessingId(userId); // Start row loading
    try {
      await axios.post("/manager/attendance", {
        user_id: userId,
        status: newStatus,
        zone_changed_orders: zoneChanged,
      });
      await fetchAttendance(); // Wait for reload
      toast.success("Updated successfully!");
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setProcessingId(null); // Stop row loading
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Daily Attendance
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <Calendar size={16} className="mr-2" />
            Today's Date:{" "}
            <span className="font-semibold ml-1">{todayDate}</span>
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4 font-medium">Employee Name</th>
                <th className="px-6 py-4 font-medium">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center">
                    <Loader2
                      className="animate-spin text-blue-500 mx-auto"
                      size={24}
                    />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No employees found in this hub.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {emp.employee_profile?.photo ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${emp.employee_profile.photo}`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold mr-3">
                            {emp.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {emp.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 flex gap-4 items-center">
                      {/* Toggle Attendance Button */}
                      <button
                        disabled={processingId === emp.id}
                        onClick={() =>
                          handleUpdateAttendance(
                            emp.id,
                            emp.today_attendance === "present"
                              ? "absent"
                              : "present",
                            emp.zone_changed_orders || 0,
                          )
                        }
                        className={`px-4 py-1.5 min-w-22.5 flex justify-center items-center rounded-lg text-sm font-medium text-white transition-opacity ${
                          processingId === emp.id
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                        } ${
                          emp.today_attendance === "present"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {processingId === emp.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : emp.today_attendance === "present" ? (
                          "Present"
                        ) : (
                          "Absent"
                        )}
                      </button>
                      {/* Zone Changed Input */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-300">
                          Zone Changed:
                        </label>
                        <input
                          type="number"
                          min="0"
                          disabled={processingId === emp.id}
                          defaultValue={emp.zone_changed_orders || 0}
                          onBlur={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            const oldValue =
                              parseInt(emp.zone_changed_orders) || 0;

                            // Only trigger API if the value actually changed
                            if (newValue !== oldValue) {
                              handleUpdateAttendance(
                                emp.id,
                                emp.today_attendance, // Keep status present when updating zones
                                newValue,
                              );
                            }
                          }}
                          className={`w-16 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white ${
                            processingId === emp.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
