import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function Fleet() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, drivers } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    license: "",
    status: "active",
    driver: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, formData);
    } else {
      addVehicle(formData);
    }
    setShowModal(false);
    setEditingVehicle(null);
    setFormData({ make: "", model: "", year: "", license: "", status: "active", driver: "" });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          Add Vehicle
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Year</th>
                <th>License Plate</th>
                <th>Assigned Driver</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="font-medium">{vehicle.make} {vehicle.model}</td>
                  <td>{vehicle.year}</td>
                  <td className="font-mono">{vehicle.license}</td>
                  <td>{vehicle.driver || "Unassigned"}</td>
                  <td>
                    <span className={`badge ${
                      vehicle.status === 'active' ? 'badge-green' :
                      vehicle.status === 'maintenance' ? 'badge-yellow' :
                      'badge-red'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="btn btn-outline px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="text-xl font-bold mb-4">
              {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    min="1990"
                    max="2030"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">License Plate</label>
                  <input
                    type="text"
                    value={formData.license}
                    onChange={(e) => setFormData({...formData, license: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Assigned Driver</label>
                  <select
                    value={formData.driver}
                    onChange={(e) => setFormData({...formData, driver: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.name}>{driver.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? "Update" : "Add"} Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVehicle(null);
                    setFormData({ make: "", model: "", year: "", license: "", status: "active", driver: "" });
                  }}
                  className="btn btn-outline"
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