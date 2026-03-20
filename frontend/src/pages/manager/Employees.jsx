import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Users,
  Mail,
  Phone,
  Calendar,
  Loader2,
  X,
  Image as ImageIcon,
} from "lucide-react";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    nid_number: "",
    expert_in: "",
    employment_type: "full_time",
    shift: "day",
    basic_salary: "",
    join_date: "",
    photo: null,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/manager/employees");
      setEmployees(response.data);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Because we are sending a file (photo), we MUST use FormData instead of a standard JSON object
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post("/manager/employees", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response.data.message);

      setIsModalOpen(false);
      // Reset Form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        nid_number: "",
        expert_in: "",
        employment_type: "full_time",
        shift: "day",
        basic_salary: "",
        join_date: "",
        photo: null,
      });

      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Hub Employees
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage staff assigned to your hub
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" />
          Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Basic Salary</th>
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
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No employees found.
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
                        {/* If the employee has a photo, show it, otherwise show an icon */}
                        {emp.employee_profile?.photo ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${emp.employee_profile.photo}`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mr-3">
                            <Users size={20} />
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 block">
                            {emp.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Joined:{" "}
                            {emp.employee_profile?.join_date
                              ? new Date(emp.employee_profile.join_date)
                                  .toLocaleDateString("en-GB")
                                  .replace(/\//g, "-")
                              : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center">
                        <Mail size={14} className="mr-2" /> {emp.email}
                      </div>
                      <div className="flex items-center">
                        <Phone size={14} className="mr-2" /> {emp.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className=" text-xs  text-green-500 capitalize">
                          {emp.employee_profile?.designation}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {emp.employee_profile?.employment_type?.replace(
                            "_",
                            " ",
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                      ৳ {emp.employee_profile?.basic_salary}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100 dark:border-slate-700 overflow-hidden my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Register New Employee
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                    Account Details
                  </h4>
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
                      className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength="6"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                    Profile Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        NID Number
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nid_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nid_number: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Join Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.join_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            join_date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Designation
                      </label>
                      <select
                        required
                        value={formData.designation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            designation: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded border outline-none"
                      >
                        <option value="">Select Designation</option>
                        <option value="Operations Manager">
                          Operations Manager
                        </option>
                        <option value="Call Center Supervisor">
                          Call Center Supervisor
                        </option>
                        <option value="Courier Operations Supervisor">
                          Courier Operations Supervisor
                        </option>
                        <option value="Customer Support Executive">
                          Customer Support Executive
                        </option>
                        <option value="Courier Support Executive">
                          Courier Support Executive
                        </option>
                        <option value="Peon">Peon</option>
                        <option value="Inventory Assistant">
                          Inventory Assistant
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        required
                        value={formData.employment_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employment_type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Basic Salary
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.basic_salary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          basic_salary: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Save Employee"
                  )}
                </button>

                <div>
                  <p>Appointed As</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-4 text-red-500">
        these buttons should be added
        <ol type="i">
          <li>Delete Button</li>
          <li>Edit Button</li>
        </ol>
      </div>
    </div>
  );
};

export default Employees;
