import { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import { Lock, Loader2 } from "lucide-react";

const DailyReport = () => {
  const [reportState, setReportState] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLocked, setTimeLocked] = useState(false);

  // New: Loading and submitting states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    received_orders: "",
    confirmed_big_orders: "",
    confirmed_small_orders: "",
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 10 || hour >= 23) setTimeLocked(true);
    fetchTodayReport();
  }, []);

  const fetchTodayReport = async () => {
    try {
      const { data } = await axios.get("/employee/daily-report/today");
      if (data.report) {
        setReportState(data.report);
        setFormData({
          received_orders: data.report.received_orders,
          confirmed_big_orders: data.report.confirmed_big_orders,
          confirmed_small_orders: data.report.confirmed_small_orders,
        });
        if (data.report.update_count >= 1) setIsLocked(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load data.");
    } finally {
      setIsLoading(false); // Stop loading regardless of success/fail
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      // Fix: Allow the user to backspace until the input is completely empty
      [e.target.name]: value === "" ? "" : Number(value),
    });
  };

  // Math calculated in real time for UI (treats empty string as 0)
  const totalConfirmed =
    (formData.confirmed_big_orders || 0) +
    (formData.confirmed_small_orders || 0);
  const cancelledOrders = (formData.received_orders || 0) - totalConfirmed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cancelledOrders < 0) {
      return toast.error("Confirmed orders cannot exceed received orders!");
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/employee/daily-report", formData);
      toast.success(data.message || "Report submitted successfully");
      setReportState(data.report);
      if (data.report.update_count >= 1) setIsLocked(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while submitting.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common Tailwind classes for inputs to keep the code clean
  const inputStyles = `
    w-full p-2 rounded border transition-colors
    bg-white dark:bg-gray-700 
    border-gray-300 dark:border-gray-600 
    text-gray-900 dark:text-gray-100
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none 
    disabled:bg-gray-100 dark:disabled:bg-gray-900 
    disabled:text-gray-500 dark:disabled:text-gray-400 
    disabled:cursor-not-allowed
  `;

  // 1. Initial Loading Screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-10 h-10 mb-4 animate-spin" />
        <p>Loading your report...</p>
      </div>
    );
  }

  // 2. Time Locked Screen
  if (timeLocked) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg max-w-4xl mx-auto">
        <Lock className="w-12 h-12 mb-2" />
        <h2 className="text-xl font-bold">Form Locked</h2>
        <p>
          The reporting form is only available between 10:00 AM and 11:00 PM.
        </p>
      </div>
    );
  }

  // 3. Main Form
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-xl shadow-md transition-colors">
      <h2 className="text-2xl font-bold mb-6">Daily Work Report</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="received_orders"
            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
          >
            Received Orders (Assigned by Manager)
          </label>
          <input
            id="received_orders"
            type="number"
            min="0"
            name="received_orders"
            value={formData.received_orders}
            onChange={handleChange}
            disabled={isLocked}
            className={inputStyles}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="confirmed_big_orders"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Confirmed Big Orders
            </label>
            <input
              id="confirmed_big_orders"
              type="number"
              min="0"
              name="confirmed_big_orders"
              value={formData.confirmed_big_orders}
              onChange={handleChange}
              disabled={isLocked}
              className={inputStyles}
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmed_small_orders"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Confirmed Small Orders
            </label>
            <input
              id="confirmed_small_orders"
              type="number"
              min="0"
              name="confirmed_small_orders"
              value={formData.confirmed_small_orders}
              onChange={handleChange}
              disabled={isLocked}
              className={inputStyles}
              required
            />
          </div>
        </div>

        {/* Read only math fields */}
        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              Total Confirmed:
            </strong>{" "}
            <span className="text-lg">{totalConfirmed}</span>
          </div>
          <div
            className={
              cancelledOrders < 0
                ? "text-red-600 dark:text-red-400 font-bold"
                : ""
            }
          >
            <strong className="text-gray-700 dark:text-gray-300">
              Cancel Orders:
            </strong>{" "}
            <span className="text-lg">{cancelledOrders}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLocked || cancelledOrders < 0 || isSubmitting}
          className={`
            flex items-center justify-center w-full md:w-auto px-8 py-2.5 rounded font-medium text-white transition-all
            ${
              isLocked || cancelledOrders < 0
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : isLocked ? (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Report Locked
            </>
          ) : (
            "Submit Report"
          )}
        </button>
      </form>
    </div>
  );
};

export default DailyReport;
