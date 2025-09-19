import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { EditIcon, TrashIcon, PlusIcon } from "../components/Icons";

export default function Fleet() {
  const { vehicles, drivers, addVehicle, updateVehicle, deleteVehicle, loading } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license: "",
    status: "active",
    driverId: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.make?.trim()) {
      newErrors.make = "Make is required";
    }
    
    if (!formData.model?.trim()) {
      newErrors.model = "Model is required";
    }
    
    if (!formData.license?.trim()) {
      newErrors.license = "License plate is required";
    }
    
    if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 2)) {
      newErrors.year = "Please enter a valid year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const result = editingVehicle 
        ? await updateVehicle(editingVehicle.id, formData)
        : await addVehicle(formData);

      if (result.success) {
        setShowModal(false);
        setEditingVehicle(null);
        setFormData({
          make: "",
          model: "",
          year: new Date().getFullYear(),
          license: "",
          status: "active",
          driverId: ""
        });
        setErrors({});
        console.log(`✅ Vehicle ${editingVehicle ? 'updated' : 'created'} successfully: ${formData.make} ${formData.model}`);
      } else {
        setErrors({
          submit: result.error || `Failed to ${editingVehicle ? 'update' : 'create'} vehicle. Please try again.`
        });
      }
    } catch (error) {
      setErrors({
        submit: `An unexpected error occurred. Please try again.`
      });
      console.error('Vehicle operation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const result = await deleteVehicle(id);
        if (!result.success) {
          console.error('Failed to delete vehicle:', result.error);
          alert(result.error || 'Failed to delete vehicle. Please try again.');
        }
      } catch (error) {
        console.error('Delete operation failed:', error);
        alert('An unexpected error occurred while deleting the vehicle.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      license: "",
      status: "active",
      driverId: ""
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon />
          Add Vehicle
        </button>
      </div>

      {loading.vehicles ? (
        <div className="card">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading vehicles...</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Make & Model</th>
                  <th>Year</th>
                  <th>License Plate</th>
                  <th>Status</th>
                  <th>Assigned Driver</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No vehicles found. Add your first vehicle to get started.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>
                        <div className="font-medium text-gray-900">
                          {vehicle.make} {vehicle.model}
                        </div>
                      </td>
                      <td>{vehicle.year}</td>
                      <td>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {vehicle.license}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${vehicle.status === 'active' ? 'badge-success' : 
                                      vehicle.status === 'maintenance' ? 'badge-warning' : 
                                      'badge-error'}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td>
                        {vehicle.driver ? (
                          <span className="text-gray-900">{vehicle.driver}</span>
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit Vehicle"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Vehicle"
                          >
                            <TrashIcon />
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
      )}

      {/* Vehicle Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {errors.submit && (
                <div className="alert alert-error">
                  {errors.submit}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Make *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${errors.make ? 'input-error' : ''}`}
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g., BMW, Mercedes"
                  />
                  {errors.make && <span className="text-error text-sm">{errors.make}</span>}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Model *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${errors.model ? 'input-error' : ''}`}
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., 7 Series, E-Class"
                  />
                  {errors.model && <span className="text-error text-sm">{errors.model}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Year</span>
                  </label>
                  <input
                    type="number"
                    className={`input input-bordered ${errors.year ? 'input-error' : ''}`}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || '' })}
                    min="1900"
                    max={new Date().getFullYear() + 2}
                  />
                  {errors.year && <span className="text-error text-sm">{errors.year}</span>}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">License Plate *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${errors.license ? 'input-error' : ''}`}
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value.toUpperCase() })}
                    placeholder="e.g., ABC-123"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.license && <span className="text-error text-sm">{errors.license}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Assigned Driver</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  >
                    <option value="">No driver assigned</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {editingVehicle ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingVehicle ? 'Update Vehicle' : 'Add Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}