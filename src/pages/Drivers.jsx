import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { validateEmail, validatePhone } from "../utils/validation";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    license: "",
    phone: "",
    email: "",
    status: "available"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Driver name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // License validation
    if (!formData.license || !formData.license.trim()) {
      newErrors.license = "License number is required";
    }

    // Phone validation
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      showWarning("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData);
        showSuccess(`Driver ${formData.name} updated successfully`);
      } else {
        await addDriver(formData);
        showSuccess(`Driver ${formData.name} added successfully`);
      }
      
      setShowModal(false);
      setEditingDriver(null);
      setFormData({ name: "", license: "", phone: "", email: "", status: "available" });
      setErrors({});
    } catch (error) {
      showError(`Failed to ${editingDriver ? 'update' : 'add'} driver: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData(driver);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const driver = drivers.find(d => d.id === id);
    if (confirm(`Are you sure you want to delete driver ${driver?.name}?`)) {
      try {
        await deleteDriver(id);
        showSuccess(`Driver ${driver?.name} deleted successfully`);
      } catch (error) {
        showError(`Failed to delete driver: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingDriver(null);
    setFormData({ name: "", license: "", phone: "", email: "", status: "available" });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          Add Driver
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">License</th>
                <th className="text-left">Phone</th>
                <th className="text-left">Email</th>
                <th className="text-left">Status</th>
                <th className="text-left">Rating</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="font-medium">{driver.name}</td>
                  <td>{driver.license}</td>
                  <td>{driver.phone}</td>
                  <td>{driver.email || "-"}</td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      driver.status === 'available' ? 'bg-green-100 text-green-700' :
                      driver.status === 'busy' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{driver.rating || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="btn btn-outline px-3 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
                        className="btn btn-danger px-3 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No drivers found. Add your first driver to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingDriver ? "Edit Driver" : "Add Driver"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter driver name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.license}
                  onChange={(e) => setFormData({...formData, license: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.license ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter license number"
                />
                {errors.license && (
                  <p className="text-red-500 text-sm mt-1">{errors.license}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="driver@example.com (optional)"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingDriver ? "Update Driver" : "Add Driver")}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-outline flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}