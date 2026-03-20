import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Building2,
  MapPin,
  User,
  Loader2,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Added for navigation

const Hubs = () => {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Navigation hook

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", location: "" });

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      const response = await axios.get("/admin/hubs");
      setHubs(response.data);
    } catch (error) {
      toast.error("Failed to load hubs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ name: "", location: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hub, e) => {
    e.stopPropagation(); // Prevent clicking the card
    setIsEditMode(true);
    setEditingId(hub.id);
    setFormData({ name: hub.name, location: hub.location });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent clicking the card
    if (!window.confirm("Are you sure you want to delete this Hub?")) return;

    try {
      await axios.delete(`/admin/hubs/${id}`);
      toast.success("Hub deleted successfully");
      fetchHubs();
    } catch (error) {
      toast.error("Failed to delete hub");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await axios.put(`/admin/hubs/${editingId}`, formData);
        toast.success("Hub updated successfully");
      } else {
        await axios.post("/admin/hubs", formData);
        toast.success("Hub created successfully");
      }
      setIsModalOpen(false);
      fetchHubs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToDashboard = (hubId) => {
    // Navigates the super admin to the manager dashboard with a hub_id query param

    navigate(`/manager?hub_id=${hubId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Manage Hubs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click on a hub card to view its Manager Dashboard
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" /> Add New Hub
        </button>
      </div>

      {/* KPI Cards for Each Hub */}
      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hubs.map((hub) => (
            <div
              key={hub.id}
              onClick={() => navigateToDashboard(hub.id)}
              className="relative p-4 rounded-xl bg-slate-800 dark:bg-slate-800 border border-slate-700 hover:border-blue-500 cursor-pointer transition shadow-lg group"
            >
              <p className="font-bold text-lg text-center text-amber-500 mb-2 truncate px-6">
                {hub.name}
              </p>

              {/* Edit / Delete Buttons (Hidden until hover) */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-2">
                <button
                  onClick={(e) => handleOpenEdit(hub, e)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(hub.id, e)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <hr className="border-slate-600 mb-3" />
              <div className="space-y-1.5">
                <p className="text-sm text-gray-300 flex justify-between">
                  <span>Total Confirm:</span>{" "}
                  <span className="font-bold text-white">
                    {hub.today_stats?.total_confirmed || 0}
                  </span>
                </p>
                <p className="text-sm text-gray-300 flex justify-between">
                  <span>Total Big:</span>{" "}
                  <span className="font-bold text-emerald-400">
                    {hub.today_stats?.total_big || 0}
                  </span>
                </p>
                <p className="text-sm text-gray-300 flex justify-between">
                  <span>Total Small:</span>{" "}
                  <span className="font-bold text-blue-400">
                    {hub.today_stats?.total_small || 0}
                  </span>
                </p>
                <p className="text-sm text-gray-300 flex justify-between">
                  <span>Zone Changed:</span>{" "}
                  <span className="font-bold text-amber-400">
                    {hub.today_stats?.total_zone_changed || 0}
                  </span>
                </p>
                <p className="text-sm text-gray-300 flex justify-between">
                  <span>Total Delivered:</span>{" "}
                  <span className="font-bold text-purple-400">
                    {hub.today_stats?.total_delivered || 0}
                  </span>
                </p>
                <p className="text-sm text-gray-300 flex justify-between pt-1 border-t border-slate-700 mt-1">
                  <span>Sent to Courier:</span>{" "}
                  <span className="font-bold text-white">
                    {hub.today_stats?.sent_to_courier || 0}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {isEditMode ? "Edit Hub" : "Add New Hub"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hub Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location Address
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg flex justify-center items-center py-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isEditMode ? (
                    "Update Hub"
                  ) : (
                    "Save Hub"
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

export default Hubs;
