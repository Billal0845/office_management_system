import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Loader2,
  Calendar,
  FileSpreadsheet,
  Search,
  UserSearch,
  ChevronDown,
} from "lucide-react";

// Hide number input spinners globally for this component
const noSpinnerStyle = `
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

const Salaries = () => {
  const { user } = useAuth();
  const [hubs, setHubs] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
    year: String(new Date().getFullYear()),
    hub_id: user.role === "manager" ? user.hub_id : "",
  });

  useEffect(() => {
    if (user.role === "super_admin") fetchHubs();
  }, [user]);

  useEffect(() => {
    if (filters.hub_id) fetchSalaries();
  }, [filters.month, filters.year, filters.hub_id]);

  const fetchHubs = async () => {
    try {
      const { data } = await axios.get("/admin/hubs");
      setHubs(data);
      if (data.length > 0 && !filters.hub_id) {
        setFilters((prev) => ({ ...prev, hub_id: data[0].id }));
      }
    } catch {
      toast.error("Failed to load hubs");
    }
  };

  const fetchSalaries = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/salaries", { params: filters });
      setSalaries(data);
    } catch {
      toast.error("Failed to fetch salary data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (id, field, value) => {
    setSalaries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleBlur = async (id, field, value) => {
    try {
      const salaryToUpdate = salaries.find((s) => s.id === id);
      const payload = {
        awards: salaryToUpdate.awards,
        advance_taken: salaryToUpdate.advance_taken,
        payment_done: salaryToUpdate.payment_done,
        [field]: value || 0,
      };
      const { data } = await axios.patch(`/salaries/${id}`, payload);
      setSalaries((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data.salary } : s)),
      );
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
      fetchSalaries();
    }
  };

  const filteredSalaries = salaries.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.employee_name?.toLowerCase().includes(term) ||
      s.user_id?.toString().includes(term) ||
      s.designation?.toLowerCase().includes(term)
    );
  });

  const fmt = (v) => Number(v).toLocaleString("en-IN");

  /* ─── column groups ─────────────────────────────────────── */
  const colGroups = [
    { label: "Employee", cols: 2, cls: "" },
    { label: "Salary Info", cols: 4, cls: "" },
    {
      label: "Adjustments",
      cols: 2,
      cls: "bg-amber-50/60 dark:bg-amber-900/10",
    },
    {
      label: "Settlement",
      cols: 3,
      cls: "bg-emerald-50/60 dark:bg-emerald-900/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-2 md:p-2 font-sans">
      <style>{noSpinnerStyle}</style>

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="mb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Salary Management
          </h1>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-2 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
          </div>

          {/* Hub */}
          {user.role === "super_admin" && (
            <div className="relative">
              <select
                value={filters.hub_id}
                onChange={(e) =>
                  setFilters({ ...filters, hub_id: e.target.value })
                }
                className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">Select Hub</option>
                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Month picker */}
          <input
            type="month"
            value={`${filters.year}-${filters.month}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              setFilters({ ...filters, year, month });
            }}
            className="pl-3 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
          />

          <button
            onClick={fetchSalaries}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all shadow-sm"
          >
            <Search className="w-4 h-4" />
            Load Data
          </button>
        </div>
      </div>

      {/* ── Table Card ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center gap-3 h-72 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            <span className="text-sm">Loading payroll data…</span>
          </div>
        ) : filteredSalaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400 dark:text-gray-500">
            <FileSpreadsheet className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">
              {searchTerm
                ? "No employees match your search."
                : "Select a hub and date to load salary data."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
              {/* Column group labels */}
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {colGroups.map((g, i) => (
                    <th
                      key={i}
                      colSpan={g.cols}
                      className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 border-r last:border-r-0 border-gray-100 dark:border-slate-700 ${g.cls}`}
                    >
                      {g.label}
                    </th>
                  ))}
                </tr>

                {/* Column headers */}
                <tr className="bg-gray-50 dark:bg-slate-700/60 border-b border-gray-100 dark:border-slate-700">
                  {/* Employee group */}
                  <th className="px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700 w-10 text-center">
                    ID
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700">
                    Employee
                  </th>

                  {/* Salary Info group */}
                  <th className="px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700">
                    Basic
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs text-blue-500 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700 text-center">
                    Present
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs text-red-400 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700 text-center">
                    Absent
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700 text-right">
                    Earned
                  </th>

                  {/* Adjustments group */}
                  <th className="px-4 py-3 font-semibold text-xs text-gray-400 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700 text-right bg-amber-50/60 dark:bg-amber-900/10">
                    Prev Due
                  </th>
                  <th className="px-4 py-3 border-r border-gray-100 dark:border-slate-700 text-center bg-amber-50/60 dark:bg-amber-900/10">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      <span className="text-[10px]">＋</span> Awards
                    </span>
                    <div className="text-[9px] text-gray-400 font-normal normal-case tracking-normal mt-0.5">
                      editable
                    </div>
                  </th>
                  <th className="px-4 py-3 border-r border-gray-100 dark:border-slate-700 text-center bg-amber-50/60 dark:bg-amber-900/10">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 uppercase tracking-wide">
                      <span className="text-[10px]">−</span> Advance
                    </span>
                    <div className="text-[9px] text-gray-400 font-normal normal-case tracking-normal mt-0.5">
                      editable
                    </div>
                  </th>

                  {/* Settlement group */}
                  <th className="px-4 py-3 font-semibold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700 text-right bg-emerald-50/60 dark:bg-emerald-900/10">
                    Payable
                  </th>
                  <th className="px-4 py-3 border-r border-gray-100 dark:border-slate-700 text-center bg-emerald-50/60 dark:bg-emerald-900/10">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Pay Now
                    </span>
                    <div className="text-[9px] text-gray-400 font-normal normal-case tracking-normal mt-0.5">
                      editable
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs text-orange-500 uppercase tracking-wide text-right bg-emerald-50/60 dark:bg-emerald-900/10">
                    Next Due
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/60">
                {filteredSalaries.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-blue-50/30 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-3.5 border-r border-gray-50 dark:border-slate-700/60 text-center">
                      <span className="text-xs font-mono font-semibold text-gray-400 dark:text-gray-500">
                        #{row.user_id}
                      </span>
                    </td>

                    {/* Employee Info */}
                    <td className="px-4 py-3.5 border-r border-gray-50 dark:border-slate-700/60">
                      <p className="font-semibold text-gray-900 dark:text-white text-[13px] leading-tight">
                        {row.employee_name}
                      </p>
                      <p className="text-[11px] font-medium text-blue-500 dark:text-blue-400 mt-0.5">
                        {row.designation || "Staff"}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {row.join_date}
                      </p>
                    </td>

                    {/* Basic */}
                    <td className="px-4 py-3.5 border-r border-gray-50 dark:border-slate-700/60 text-gray-700 dark:text-gray-300 font-medium text-right tabular-nums">
                      ৳ {fmt(row.basic_salary)}
                    </td>

                    {/* Present */}
                    <td className="px-4 py-3.5 border-r border-gray-50 dark:border-slate-700/60 text-center">
                      <span className="inline-block w-8 h-8 leading-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm text-center">
                        {row.present_days}
                      </span>
                    </td>

                    {/* Absent */}
                    <td className="px-4 py-3.5 border-r border-gray-50 dark:border-slate-700/60 text-center">
                      <span className="inline-block w-8 h-8 leading-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 font-bold text-sm text-center">
                        {row.absent_days}
                      </span>
                    </td>

                    {/* Earned */}
                    <td className="px-4 py-3.5 border-r border-gray-50 dark:border-slate-700/60 font-semibold text-gray-800 dark:text-white text-right tabular-nums">
                      ৳ {fmt(row.pay_for_salary)}
                    </td>

                    {/* Prev Due */}
                    <td className="px-4 py-3.5 border-r border-gray-50 dark:border-slate-700/60 text-gray-400 text-right tabular-nums bg-amber-50/30 dark:bg-amber-900/5">
                      ৳ {fmt(row.previous_due)}
                    </td>

                    {/* Awards — editable */}
                    <td className="p-0 border-r border-gray-50 dark:border-slate-700/60 bg-amber-50/30 dark:bg-amber-900/5">
                      <input
                        type="number"
                        value={row.awards}
                        onChange={(e) =>
                          handleInputChange(row.id, "awards", e.target.value)
                        }
                        onBlur={(e) =>
                          handleBlur(row.id, "awards", e.target.value)
                        }
                        className="w-28 h-full min-h-[58px] px-3 text-right tabular-nums bg-transparent outline-none focus:bg-amber-100/80 dark:focus:bg-amber-900/30 focus:ring-2 focus:ring-inset focus:ring-amber-400 text-emerald-600 dark:text-emerald-400 font-semibold text-sm transition-all cursor-text hover:bg-amber-50 dark:hover:bg-amber-900/20 w-full"
                      />
                    </td>

                    {/* Advance — editable */}
                    <td className="p-0 border-r border-gray-50 dark:border-slate-700/60 bg-amber-50/30 dark:bg-amber-900/5">
                      <input
                        type="number"
                        value={row.advance_taken}
                        onChange={(e) =>
                          handleInputChange(
                            row.id,
                            "advance_taken",
                            e.target.value,
                          )
                        }
                        onBlur={(e) =>
                          handleBlur(row.id, "advance_taken", e.target.value)
                        }
                        className="w-28 h-full min-h-[58px] px-3 text-right tabular-nums bg-transparent outline-none focus:bg-red-50 dark:focus:bg-red-900/30 focus:ring-2 focus:ring-inset focus:ring-red-400 text-red-500 font-semibold text-sm transition-all cursor-text hover:bg-red-50/60 dark:hover:bg-red-900/20 w-full"
                      />
                    </td>

                    {/* Total Payable */}
                    <td className="px-4 py-3.5 border-r border-gray-50 dark:border-slate-700/60 bg-emerald-50/40 dark:bg-emerald-900/10">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[13px] tabular-nums block text-right">
                        ৳ {fmt(row.total_payable)}
                      </span>
                    </td>

                    {/* Payment Done — editable */}
                    <td className="p-0 border-r border-gray-50 dark:border-slate-700/60 bg-emerald-50/40 dark:bg-emerald-900/10">
                      <input
                        type="number"
                        value={row.payment_done}
                        onChange={(e) =>
                          handleInputChange(
                            row.id,
                            "payment_done",
                            e.target.value,
                          )
                        }
                        onBlur={(e) =>
                          handleBlur(row.id, "payment_done", e.target.value)
                        }
                        placeholder="0"
                        className="w-full min-h-[58px] px-3 text-right tabular-nums bg-blue-50/80 dark:bg-blue-900/20 outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold text-blue-700 dark:text-blue-300 text-sm transition-all cursor-text hover:bg-blue-100/70 dark:hover:bg-blue-900/40"
                      />
                    </td>

                    {/* Next Due */}
                    <td className="px-4 py-3.5 text-right tabular-nums bg-emerald-50/40 dark:bg-emerald-900/10">
                      <span
                        className={`font-bold text-[13px] ${
                          Number(row.next_pay) > 0
                            ? "text-orange-500 dark:text-orange-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      >
                        {Number(row.next_pay) > 0
                          ? `৳ ${fmt(row.next_pay)}`
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Footer summary row */}
              <tfoot>
                <tr className="bg-gray-50 dark:bg-slate-700/40 border-t-2 border-gray-200 dark:border-slate-600">
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-r border-gray-100 dark:border-slate-700"
                  >
                    {filteredSalaries.length} employees
                  </td>
                  <td
                    colSpan={3}
                    className="border-r border-gray-100 dark:border-slate-700"
                  />
                  <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-white tabular-nums text-sm border-r border-gray-100 dark:border-slate-700">
                    ৳{" "}
                    {fmt(
                      filteredSalaries.reduce(
                        (s, r) => s + Number(r.pay_for_salary),
                        0,
                      ),
                    )}
                  </td>
                  <td className="border-r border-gray-100 dark:border-slate-700 bg-amber-50/60 dark:bg-amber-900/10" />
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 tabular-nums text-sm border-r border-gray-100 dark:border-slate-700 bg-amber-50/60 dark:bg-amber-900/10">
                    ৳{" "}
                    {fmt(
                      filteredSalaries.reduce(
                        (s, r) => s + Number(r.awards),
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-500 tabular-nums text-sm border-r border-gray-100 dark:border-slate-700 bg-amber-50/60 dark:bg-amber-900/10">
                    ৳{" "}
                    {fmt(
                      filteredSalaries.reduce(
                        (s, r) => s + Number(r.advance_taken),
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums text-sm border-r border-gray-100 dark:border-slate-700 bg-emerald-50/60 dark:bg-emerald-900/10">
                    ৳{" "}
                    {fmt(
                      filteredSalaries.reduce(
                        (s, r) => s + Number(r.total_payable),
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700 dark:text-blue-300 tabular-nums text-sm border-r border-gray-100 dark:border-slate-700 bg-emerald-50/60 dark:bg-emerald-900/10">
                    ৳{" "}
                    {fmt(
                      filteredSalaries.reduce(
                        (s, r) => s + Number(r.payment_done || 0),
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-orange-500 tabular-nums text-sm bg-emerald-50/60 dark:bg-emerald-900/10">
                    ৳{" "}
                    {fmt(
                      filteredSalaries.reduce(
                        (s, r) => s + Number(r.next_pay),
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salaries;
