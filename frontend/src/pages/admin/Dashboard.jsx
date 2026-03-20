import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import {
  PackageCheck,
  MapPin,
  Truck,
  CheckCircle,
  Banknote,
  DollarSign,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filter, setFilter] = useState("today"); // today, month, all, custom
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    // Only fetch automatically if it's not custom, or if custom dates are filled
    if (
      filter !== "custom" ||
      (filter === "custom" && customStart && customEnd)
    ) {
      fetchKpis();
    }
  }, [filter]);

  const fetchKpis = async () => {
    setLoading(true);
    try {
      const params = { filter };
      if (filter === "custom") {
        params.start_date = customStart;
        params.end_date = customEnd;
      }
      const response = await axios.get("/admin/dashboard/kpis", { params });
      setKpis(response.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) {
      return toast.error("Please select both start and end dates");
    }
    fetchKpis();
  };

  return (
    <div className="space-y-6 p-2 md:p-4">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome back,{" "}
          <span className="text-blue-600 dark:text-blue-500">
            {user?.name}!
          </span>
        </h2>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
          <Filter className="w-5 h-5 text-blue-500" /> Filter Data:
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="today">Today</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
          <option value="custom">Custom Range</option>
        </select>

        {filter === "custom" && (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 outline-none"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 outline-none"
            />
            <button
              onClick={handleCustomApply}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Total Confirm Orders */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex justify-center items-center">
              <PackageCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total Confirm Orders
              </p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                {kpis?.total_confirm_orders.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* 2. Total Zone Changed */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/30 flex justify-center items-center">
              <MapPin className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total Zone Changed
              </p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                {kpis?.total_zone_changed.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* 3. Total Sent to Courier */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex justify-center items-center">
              <Truck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total Sent to Courier
              </p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                {kpis?.total_sent_to_courier.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* 4. Total Delivery */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex justify-center items-center">
              <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total Delivery
              </p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                {kpis?.total_delivery.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* 5. Total Cash Received */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-900/30 flex justify-center items-center">
              <Banknote className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total Cash Received (৳)
              </p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                ৳ {kpis?.total_cash_received.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* 6. Total Spent Dollar */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-900/30 flex justify-center items-center">
              <DollarSign className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total Spent Dollar (Ads)
              </p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                $ {kpis?.total_spent_dollar.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
