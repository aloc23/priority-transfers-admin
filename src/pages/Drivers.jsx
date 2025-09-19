import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { validateEmail, validatePhone } from "../utils/validation";

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver, loading } = useAppStore();
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

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.license?.trim()) {
      newErrors.license = "License number is required";
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    // Email validation (optional field)
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors and validate form
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let result;
      if (editingDriver) {
        result = await updateDriver(editingDriver.id, formData);
      } else {
        result = await addDriver(formData);
      }
      
      if (result.success) {
        // Success - close modal and reset form
        setShowModal(false);
        setEditingDriver(null);
        setFormData({ name: "", license: "", phone: "", email: "", status: "available" });
        setErrors({});
        
        // Show success feedback (you can add a notification system later)
        console.log(`Driver ${editingDriver ? 'updated' : 'created'} successfully`);
      } else {
        // Handle API error
        setErrors({
          submit: result.error || `Failed to ${editingDriver ? 'update' : 'create'} driver. Please try again.`
        });
      }
    } catch (error) {
      // Handle unexpected errors
      setErrors({
        submit: `An unexpected error occurred. Please try again.`
      });
      console.error('Driver operation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData(driver);
    setErrors({}); // Clear any previous errors
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      try {
        const result = await deleteDriver(id);
        if (!result.success) {
          // Handle delete error - you could show a notification here
          console.error('Failed to delete driver:', result.error);
          alert(result.error || 'Failed to delete driver. Please try again.');
        }
      } catch (error) {
        console.error('Delete operation failed:', error);
        alert('An unexpected error occurred while deleting the driver.');
      }
    }
  };

  return (
    <div className="space-y-6">
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
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>License</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading?.drivers ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading drivers...</span>
                    </div>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No drivers found. Click "Add Driver" to create your first driver.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="font-medium">{driver.name}</td>
                    <td>{driver.license}</td>
                    <td>{driver.phone}</td>
                    <td>{driver.email || "-"}</td>
                    <td>
                      <span className={`badge ${
                        driver.status === 'available' ? 'badge-green' :
                        driver.status === 'busy' ? 'badge-red' :
                        'badge-yellow'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{driver.rating || 5.0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(driver)}
                          className="btn btn-outline px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                        >
                          Delete
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

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="text-xl font-bold mb-4">
              {editingDriver ? "Edit Driver" : "Add Driver"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Submit Error Message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">
                    {errors.submit}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.license}
                  onChange={(e) => setFormData({...formData, license: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.license 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                  disabled={isSubmitting}
                />
                {errors.license && (
                  <p className="text-red-500 text-sm mt-1">{errors.license}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phone 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="driver@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isSubmitting 
                    ? (editingDriver ? "Updating..." : "Adding...") 
                    : (editingDriver ? "Update" : "Add") + " Driver"
                  }
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDriver(null);
                    setFormData({ name: "", license: "", phone: "", email: "", status: "available" });
                    setErrors({});
                  }}
                  className="btn btn-outline"
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