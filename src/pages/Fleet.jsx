import { useState, useEffect } from "react";
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from "../api/vehicles";

export default function Fleet() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    plate_number: "",
    year: "",
    capacity: 4,
    fuel_type: "",
    fuel_cost: 0,
    insurance_cost: 0,
    maintenance_cost: 0,
    depreciation_cost: 0,
    service_cost: 0,
    tax_cost: 0,
    lease_cost: 0,
    other_costs: 0,
  });
  const [showRunningCostModal, setShowRunningCostModal] = useState(false);
  const [runningCostForm, setRunningCostForm] = useState({
    fuel_cost: 0,
    insurance_cost: 0,
    maintenance_cost: 0,
    depreciation_cost: 0,
    service_cost: 0,
    tax_cost: 0,
    lease_cost: 0,
    other_costs: 0,
  });
  const [runningCostResult, setRunningCostResult] = useState(null);

  useEffect(() => {
    loadFleet();
  }, []);

  async function loadFleet() {
    setLoading(true);
    try {
      const data = await fetchVehicles();
      setFleet(data);
    } catch (err) {
      console.error("Error loading vehicles", err);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData);
      } else {
        await createVehicle(formData);
      }
      setShowModal(false);
      setEditingVehicle(null);
      await loadFleet();
    } catch (err) {
      console.error("Error saving vehicle", err);
    }
  }

  async function handleDelete(id) {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      await deleteVehicle(id);
      await loadFleet();
    }
  }

  function handleEdit(vehicle) {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setShowModal(true);
  }

  function openRunningCostModal(vehicle) {
    setShowRunningCostModal(true);
    setRunningCostForm({
      fuel_cost: vehicle.fuel_cost || 0,
      insurance_cost: vehicle.insurance_cost || 0,
      maintenance_cost: vehicle.maintenance_cost || 0,
      depreciation_cost: vehicle.depreciation_cost || 0,
      service_cost: vehicle.service_cost || 0,
      tax_cost: vehicle.tax_cost || 0,
      lease_cost: vehicle.lease_cost || 0,
      other_costs: vehicle.other_costs || 0,
    });
  }

  function calculateRunningCosts() {
    const total =
      (Number(runningCostForm.fuel_cost) || 0) +
      (Number(runningCostForm.insurance_cost) || 0) +
      (Number(runningCostForm.maintenance_cost) || 0) +
      (Number(runningCostForm.depreciation_cost) || 0) +
      (Number(runningCostForm.service_cost) || 0) +
      (Number(runningCostForm.tax_cost) || 0) +
      (Number(runningCostForm.lease_cost) || 0) +
      (Number(runningCostForm.other_costs) || 0);

    setRunningCostResult(total);
  }

  if (loading) return <div className="p-4">Loading fleet...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fleet Management</h1>

      <button
        className="mb-4 rounded bg-green-600 px-4 py-2 text-white"
        onClick={() => setShowModal(true)}
      >
        Add Vehicle
      </button>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Make</th>
            <th className="p-2 border">Model</th>
            <th className="p-2 border">Plate</th>
            <th className="p-2 border">Year</th>
            <th className="p-2 border">Costs (€)</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fleet.map((v) => (
            <tr key={v.id}>
              <td className="p-2 border">{v.make}</td>
              <td className="p-2 border">{v.model}</td>
              <td className="p-2 border">{v.plate_number}</td>
              <td className="p-2 border">{v.year}</td>
              <td className="p-2 border">{v.total_running_cost}</td>
              <td className="p-2 border space-x-2">
                <button
                  className="rounded bg-blue-500 px-2 py-1 text-white"
                  onClick={() => handleEdit(v)}
                >
                  Edit
                </button>
                <button
                  className="rounded bg-yellow-500 px-2 py-1 text-white"
                  onClick={() => openRunningCostModal(v)}
                >
                  Configurator
                </button>
                <button
                  className="rounded bg-red-500 px-2 py-1 text-white"
                  onClick={() => handleDelete(v.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl mb-4">{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input className="w-full border p-2" placeholder="Make" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} />
              <input className="w-full border p-2" placeholder="Model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
              <input className="w-full border p-2" placeholder="Plate Number" value={formData.plate_number} onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })} />
              <input className="w-full border p-2" placeholder="Year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
              <button className="rounded bg-green-600 px-4 py-2 text-white" type="submit">Save</button>
              <button className="ml-2 rounded bg-gray-400 px-4 py-2 text-white" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showRunningCostModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl mb-4">Vehicle Configurator</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                calculateRunningCosts();
              }}
              className="space-y-2"
            >
              {Object.keys(runningCostForm).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize">{field.replace("_", " ")}</label>
                  <input
                    type="number"
                    className="w-full border p-2"
                    value={runningCostForm[field]}
                    onChange={(e) => setRunningCostForm({ ...runningCostForm, [field]: e.target.value })}
                  />
                </div>
              ))}
              <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">Calculate</button>
              <button className="ml-2 rounded bg-gray-400 px-4 py-2 text-white" onClick={() => setShowRunningCostModal(false)}>Close</button>
            </form>

            {runningCostResult !== null && (
              <div className="mt-4 text-lg font-bold">Total Running Cost: €{runningCostResult}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
