import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import {
  Plus,
  UserCircle,
  Mail,
  Phone,
  Building2,
  Loader2,
  X,
  Edit,
  Trash2,
} from "lucide-react";

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    password: "",
    hub_id: "",
    basic_salary: "",
    join_date: new Date().toISOString().split("T")[0], // Defaults to today
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [managersRes, hubsRes] = await Promise.all([
        axios.get("/admin/managers"),
        axios.get("/admin/hubs"),
      ]);
      setManagers(managersRes.data);
      setHubs(hubsRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Submission (Both Create & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const response = await axios.put(
          `/admin/managers/${editingId}`,
          formData,
        );
        toast.success(response.data.message || "Manager updated successfully");
      } else {
        const response = await axios.post("/admin/managers", formData);
        toast.success(response.data.message || "Manager created successfully");
      }

      handleCloseModal();
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (manager) => {
    setIsEditMode(true);
    setEditingId(manager.id);
    setFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      password: "", // Keep empty, user only fills it if they want to change the password
      hub_id: manager.hub_id || "",
      basic_salary: manager.employee_profile?.basic_salary || "",
      join_date:
        manager.employee_profile?.join_date || initialFormState.join_date,
    });
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setIsEditMode(false);
    setEditingId(null);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this manager? This action cannot be undone.",
      )
    )
      return;

    try {
      await axios.delete(`/admin/managers/${id}`);
      toast.success("Manager deleted successfully");
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete manager");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Manage Managers
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create managers, manage salaries, and assign hubs
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" />
          Add New Manager
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4 font-medium">Manager Details</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Assigned Hub</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <Loader2
                      className="animate-spin text-blue-500 mx-auto"
                      size={24}
                    />
                  </td>
                </tr>
              ) : managers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No managers found. Create one to get started.
                  </td>
                </tr>
              ) : (
                managers.map((manager) => (
                  <tr
                    key={manager.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                  >
                    {/* Manager Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mr-3">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200 block">
                            {manager.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Basic: ৳{" "}
                            {manager.employee_profile?.basic_salary || 0}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Mail size={14} className="mr-2" /> {manager.email}
                        </div>
                        <div className="flex items-center">
                          <Phone size={14} className="mr-2" /> {manager.phone}
                        </div>
                      </div>
                    </td>

                    {/* Hub Info */}
                    <td className="px-6 py-4">
                      {manager.managed_hub ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                          <Building2 size={12} className="mr-1.5" />
                          {manager.managed_hub.name}
                        </span>
                      ) : (
                        <span className="text-sm text-red-500 dark:text-red-400">
                          Not Assigned
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(manager)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded transition"
                          title="Edit Manager"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(manager.id)}
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded transition"
                          title="Delete Manager"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 dark:border-slate-700 my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {isEditMode ? "Edit Manager" : "Add New Manager"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 p-1.5 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password{" "}
                    {isEditMode && (
                      <span className="text-[10px] text-gray-400">
                        (Leave blank to keep current)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    required={!isEditMode}
                    minLength="6"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder={isEditMode ? "********" : ""}
                  />
                </div>

                {/* Basic Salary (NEW) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Basic Salary (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.basic_salary}
                    onChange={(e) =>
                      setFormData({ ...formData, basic_salary: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                {/* Join Date (NEW) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.join_date}
                    onChange={(e) =>
                      setFormData({ ...formData, join_date: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                {/* Assign Hub */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assign to Hub
                  </label>
                  <select
                    required
                    value={formData.hub_id}
                    onChange={(e) =>
                      setFormData({ ...formData, hub_id: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
                  >
                    <option value="">Select a Hub...</option>
                    {hubs.map((hub) => (
                      <option key={hub.id} value={hub.id}>
                        {hub.name} ({hub.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex justify-center items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isEditMode ? (
                    "Update Manager"
                  ) : (
                    "Save Manager"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Managers;
