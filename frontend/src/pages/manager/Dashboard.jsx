import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import {
  PackageCheck,
  PackagePlus,
  PackageMinus,
  XCircle,
  MapPin,
  Users,
  Phone,
  X,
  Loader2,
  CalendarDays,
  Save,
  FileSpreadsheet,
} from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Manager Report (Updated with new fields)
  const [reportForm, setReportForm] = useState({
    website_orders: "",
    legal_orders: "",
    sent_to_courier_in_courier_dashboard: "",
    total_delivered_order: "",
    total_cash_received_from_courier: "",
    total_spent_dollar: "",
  });

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const hubId = queryParams.get("hub_id");

      const response = await axios.get("/manager/dashboard", {
        params: hubId ? { hub_id: hubId } : {},
      });

      setData(response.data);
      if (response.data.manager_report) {
        const mr = response.data.manager_report;
        setReportForm({
          website_orders: mr.website_orders ?? "",
          legal_orders: mr.legal_orders ?? "",
          sent_to_courier_in_courier_dashboard:
            mr.sent_to_courier_in_courier_dashboard ?? "",
          total_delivered_order: mr.total_delivered_order ?? "",
          total_cash_received_from_courier:
            mr.total_cash_received_from_courier ?? "",
          total_spent_dollar: mr.total_spent_dollar ?? "",
        });
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (Number(reportForm.legal_orders) > Number(reportForm.website_orders)) {
      return toast.error("Legal orders cannot exceed Website orders!");
    }

    setIsSubmitting(true);
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const hubId = queryParams.get("hub_id");

      // FIX IS HERE: Use ...reportForm to spread the properties
      const response = await axios.post("/manager/dashboard/report", {
        ...reportForm,
        hub_id: hubId,
      });

      toast.success(response.data.message);
      setData((prev) => ({
        ...prev,
        manager_report: response.data.report,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const { kpis, attendance } = data;

  // Morning Report Auto-calculations
  const duplicateOrders =
    reportForm.website_orders !== ""
      ? reportForm.website_orders - reportForm.legal_orders
      : 0;

  // Evening Closing Summary Math
  const totalZoneChanged = Number(kpis.total_zone_changed) || 0;
  const totalConfirmFromEmployees = Number(kpis.total_confirmed) || 0;

  const totalSentToCourier = totalConfirmFromEmployees - totalZoneChanged;
  const todayTotal = totalZoneChanged + totalSentToCourier;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manager Dashboard
          </h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <CalendarDays className="w-4 h-4" /> {todayDate}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Confirmed */}
        <div className="bg-blue-600 text-white rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-blue-100 font-medium text-sm leading-tight">
              Total Confirmed <br />
              (By Employees)
            </p>
            <PackageCheck className="text-blue-200 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mt-2">
            {totalConfirmFromEmployees}
          </h3>
        </div>

        {/* Total Big */}
        <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-emerald-100 font-medium text-sm">
              Total Big Orders
            </p>
            <PackagePlus className="text-emerald-200 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mt-2">{kpis.total_big}</h3>
        </div>

        {/* Total Small */}
        <div className="bg-teal-600 text-white rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-teal-100 font-medium text-sm">
              Total Small Orders
            </p>
            <PackageMinus className="text-teal-200 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mt-2">{kpis.total_small}</h3>
        </div>

        {/* Total Cancelled */}
        <div className="bg-rose-600 text-white rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-rose-100 font-medium text-sm">Total Cancelled</p>
            <XCircle className="text-rose-200 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mt-2">{kpis.total_cancelled}</h3>
        </div>

        {/* Total Zone Changed */}
        <div className="bg-amber-500 text-white rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-amber-100 font-medium text-sm">Zone Changed</p>
            <MapPin className="text-amber-200 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mt-2">{totalZoneChanged}</h3>
        </div>

        {/* Attendance Interactive Card */}
        <div className="bg-indigo-600 text-white rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-indigo-100 font-medium text-sm flex items-center gap-1">
              <Users className="w-4 h-4" /> Attendance
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-indigo-700/50 rounded py-1">
              <p className="text-[10px] sm:text-xs text-indigo-200">Total</p>
              <p className="font-bold text-base sm:text-lg">
                {attendance.total}
              </p>
            </div>
            <div className="bg-indigo-700/50 rounded py-1">
              <p className="text-[10px] sm:text-xs text-indigo-200">Present</p>
              <p className="font-bold text-base sm:text-lg">
                {attendance.present}
              </p>
            </div>
            {/* Clickable Absent Button */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="bg-red-500/80 hover:bg-red-500 cursor-pointer transition rounded py-1 border border-red-400"
            >
              <p className="text-[10px] sm:text-xs text-white font-medium">
                Absent
              </p>
              <p className="font-bold text-base sm:text-lg">
                {attendance.absent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Report Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Morning Report Input Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 dark:text-white border-b dark:border-slate-700 pb-2">
            <FileSpreadsheet className="text-blue-500 w-5 h-5" /> Daily
            Financial & Orders Report
          </h2>

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website Orders (Total Pending)
              </label>
              <input
                type="number"
                required
                value={reportForm.website_orders}
                onChange={(e) =>
                  setReportForm({
                    ...reportForm,
                    website_orders: e.target.value,
                  })
                }
                className="w-full border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Legal Orders
                </label>
                <input
                  type="number"
                  required
                  value={reportForm.legal_orders}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      legal_orders: e.target.value,
                    })
                  }
                  className="w-full border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duplicate/Fake
                </label>
                <input
                  type="text"
                  readOnly
                  value={duplicateOrders}
                  className="w-full border border-gray-200 bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400 px-4 py-2 rounded-lg text-red-500 font-bold outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* 4 NEW INPUT FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t dark:border-slate-700 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sent to Courier (Courier Dashboard)
                </label>
                <input
                  type="number"
                  required
                  value={reportForm.sent_to_courier_in_courier_dashboard}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      sent_to_courier_in_courier_dashboard: e.target.value,
                    })
                  }
                  className="w-full border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Delivered Order
                </label>
                <input
                  type="number"
                  required
                  value={reportForm.total_delivered_order}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      total_delivered_order: e.target.value,
                    })
                  }
                  className="w-full border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Cash Received from Courier (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={reportForm.total_cash_received_from_courier}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      total_cash_received_from_courier: e.target.value,
                    })
                  }
                  className="w-full border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Spent Dollar (Ads Cost $)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={reportForm.total_spent_dollar}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      total_spent_dollar: e.target.value,
                    })
                  }
                  className="w-full border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center font-medium gap-2 transition mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Report Data
                </>
              )}
            </button>
          </form>
        </div>

        {/* Evening Closing Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 p-6 flex flex-col">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 dark:text-white border-b dark:border-slate-700 pb-2">
            <PackageCheck className="text-green-500 w-5 h-5" /> Evening Closing
            Summary
          </h2>

          <div className="space-y-4 mt-2 grow flex flex-col justify-center">
            {/* iv. Total Zone Changed */}
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Total Zone Changed
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-xl">
                {totalZoneChanged}
              </span>
            </div>

            {/* v. Total Sent to Courier */}
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Total Sent to Courier <br />
                <span className="text-xs text-gray-400">
                  (Total Confirm – Total Zone Changed)
                </span>
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-xl">
                {totalSentToCourier}
              </span>
            </div>

            {/* vi. Today Total Orders */}
            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg mt-auto">
              <span className="text-green-800 dark:text-green-400 font-bold text-lg">
                Today Total Orders
              </span>
              <span className="font-black text-green-600 dark:text-green-400 text-2xl">
                {todayTotal}
              </span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              * Today Total = Zone Changed + Sent to Courier
            </p>
          </div>
        </div>
      </div>

      {/* Absent Employees Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30">
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <Users className="w-5 h-5" /> Absent Employees Today
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {attendance.absent_list.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  Great! Everyone is present today.
                </div>
              ) : (
                <ul className="space-y-3">
                  {attendance.absent_list.map((emp) => (
                    <li
                      key={emp.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600"
                    >
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">
                          {emp.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {emp.employee_profile?.designation || "Staff"}
                        </p>
                      </div>
                      <a
                        href={`tel:${emp.phone}`}
                        className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium transition"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
