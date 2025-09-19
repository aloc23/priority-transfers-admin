import { useState } from "react";
import { useFleet } from "../context/FleetContext";
import { EditIcon, TrashIcon } from "../components/Icons";

export default function Fleet() {
  const { fleet, addVehicle, editVehicle, deleteVehicle } = useFleet();
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "Luxury Sedan",
    driverRate: 15,
    fuelRate: 0.45,
    runningCost: 0.25,
    insuranceRate: 25,
    capacity: 4
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showRunningCostModal, setShowRunningCostModal] = useState(false);
  const [runningCostForm, setRunningCostForm] = useState({
    maintenance: 0,
    depreciation: 0,
    insurance: 0,
    roadTax: 0,
    mot: 0,
    cleaning: 0,
    other: 0,
    mileage: 30000
  });
  const [runningCostResult, setRunningCostResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingVehicle) {
      editVehicle(editingVehicle.id, formData);
    } else {
      addVehicle({ ...formData, id: formData.id || `NEW-${Date.now()}` });
    }
    setShowModal(false);
    setEditingVehicle(null);
    setFormData({ id: "", name: "", type: "Luxury Sedan", driverRate: 15, fuelRate: 0.45, runningCost: 0.25, insuranceRate: 25, capacity: 4 });
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

  function openRunningCostModal() {
    setShowRunningCostModal(true);
    setRunningCostForm({
      maintenance: 0,
      depreciation: 0,
      insurance: 0,
      roadTax: 0,
      mot: 0,
      cleaning: 0,
      other: 0,
      mileage: 30000
    });
    setRunningCostResult(null);
  }

  function calculateRunningCost() {
    const { maintenance, depreciation, insurance, roadTax, mot, cleaning, other, mileage } = runningCostForm;
    const totalAnnualCost = maintenance + depreciation + insurance + roadTax + mot + cleaning + other;
    const costPerMile = mileage > 0 ? totalAnnualCost / mileage : 0;
    setRunningCostResult({ totalAnnualCost, costPerMile });
  }

  function applyRunningCostToVehicle() {
    if (selectedVehicle && runningCostResult) {
      setSelectedVehicle(v => ({ ...v, runningCost: parseFloat(runningCostResult.costPerMile.toFixed(3)) }));
      setShowRunningCostModal(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Fleet vehicle list */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Fleet Vehicles</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ Add Vehicle</button>
        </div>
        <div className="space-y-3">
          {fleet.map(vehicle => (
            <div key={vehicle.id} className={`border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer ${selectedVehicle?.id === vehicle.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedVehicle(vehicle)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">{vehicle.name}</h4>
                  <p className="text-sm text-gray-600">{vehicle.type} • {vehicle.capacity} seats</p>
                  <div className="text-xs text-gray-500 mt-1">Running: €{vehicle.runningCost}/mile • Driver: €{vehicle.driverRate}/hr</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); handleEdit(vehicle); }} className="text-blue-500 hover:text-blue-700 text-sm" title="Edit Vehicle"><EditIcon /></button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(vehicle.id); }} className="text-red-500 hover:text-red-700 text-sm" title="Delete Vehicle"><TrashIcon /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle configurator */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Vehicle Configuration</h2>
        {selectedVehicle ? (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); editVehicle(selectedVehicle.id, selectedVehicle); }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Vehicle ID</label>
                <input type="text" value={selectedVehicle.id} onChange={e => setSelectedVehicle(v => ({ ...v, id: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">Vehicle Name</label>
                <input type="text" value={selectedVehicle.name} onChange={e => setSelectedVehicle(v => ({ ...v, name: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">Vehicle Type</label>
                <select value={selectedVehicle.type} onChange={e => setSelectedVehicle(v => ({ ...v, type: e.target.value }))}>
                  <option value="Luxury Sedan">Luxury Sedan</option>
                  <option value="Executive SUV">Executive SUV</option>
                  <option value="Limousine">Limousine</option>
                  <option value="Minibus">Minibus</option>
                  <option value="Coach">Coach</option>
                  <option value="Luxury Coach">Luxury Coach</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Driver Rate (€/hr)</label>
                <input type="number" value={selectedVehicle.driverRate} onChange={e => setSelectedVehicle(v => ({ ...v, driverRate: parseFloat(e.target.value) }))} step="0.50" />
              </div>
              <div>
                <label className="block mb-1">Fuel Rate (€/mile)</label>
                <input type="number" value={selectedVehicle.fuelRate} onChange={e => setSelectedVehicle(v => ({ ...v, fuelRate: parseFloat(e.target.value) }))} step="0.01" />
              </div>
              <div>
                <label className="block mb-1">Running Cost (€/mile)</label>
                <input type="number" value={selectedVehicle.runningCost} onChange={e => setSelectedVehicle(v => ({ ...v, runningCost: parseFloat(e.target.value) }))} step="0.01" />
                <button type="button" className="ml-2 px-2 py-1 bg-gray-100 rounded border" onClick={openRunningCostModal}>Calculate</button>
              </div>
              <div>
                <label className="block mb-1">Business Insurance/Day (€)</label>
                <input type="number" value={selectedVehicle.insuranceRate} onChange={e => setSelectedVehicle(v => ({ ...v, insuranceRate: parseFloat(e.target.value) }))} />
              </div>
              <div>
                <label className="block mb-1">Capacity</label>
                <input type="number" value={selectedVehicle.capacity} onChange={e => setSelectedVehicle(v => ({ ...v, capacity: parseInt(e.target.value) }))} min="1" />
              </div>
            </div>
            <button type="submit" className="btn btn-success mt-4">Save Vehicle</button>
          </form>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Select a vehicle from the list or add a new one to configure</p>
          </div>
        )}
      </div>

      {/* Calculation Results Section */}
      {selectedVehicle && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Vehicle Calculation Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fleet-results-mobile">
            
            {/* Cost Overview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Cost Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Driver Rate:</span>
                  <span className="font-medium">€{selectedVehicle.driverRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Cost:</span>
                  <span className="font-medium">€{selectedVehicle.fuelRate}/mile</span>
                </div>
                <div className="flex justify-between">
                  <span>Running Cost:</span>
                  <span className="font-medium">€{selectedVehicle.runningCost}/mile</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance/Day:</span>
                  <span className="font-medium">€{selectedVehicle.insuranceRate}</span>
                </div>
              </div>
            </div>

            {/* Sample Journey Calculations */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Sample Journey (50 miles, 2 hrs)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Driver Cost:</span>
                  <span className="font-medium">€{(selectedVehicle.driverRate * 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Cost:</span>
                  <span className="font-medium">€{(selectedVehicle.fuelRate * 50).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Running Cost:</span>
                  <span className="font-medium">€{(selectedVehicle.runningCost * 50).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance:</span>
                  <span className="font-medium">€{selectedVehicle.insuranceRate}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium text-green-700">
                    <span>Total Cost:</span>
                    <span>€{((selectedVehicle.driverRate * 2) + (selectedVehicle.fuelRate * 50) + (selectedVehicle.runningCost * 50) + selectedVehicle.insuranceRate).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Metrics */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3">Vehicle Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{selectedVehicle.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span className="font-medium">{selectedVehicle.capacity} passengers</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per Mile:</span>
                  <span className="font-medium">€{(selectedVehicle.fuelRate + selectedVehicle.runningCost).toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Break-even (per mile):</span>
                  <span className="font-medium">€{((selectedVehicle.fuelRate + selectedVehicle.runningCost) * 1.3).toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-3">
            <button 
              className="btn btn-outline"
              onClick={() => window.print()}
            >
              Print Results
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                navigator.clipboard.writeText(
                  `Vehicle: ${selectedVehicle.name}\n` +
                  `Type: ${selectedVehicle.type}\n` +
                  `Driver Rate: €${selectedVehicle.driverRate}/hr\n` +
                  `Fuel Cost: €${selectedVehicle.fuelRate}/mile\n` +
                  `Running Cost: €${selectedVehicle.runningCost}/mile\n` +
                  `Insurance: €${selectedVehicle.insuranceRate}/day`
                );
                alert('Vehicle details copied to clipboard!');
              }}
            >
              Copy Details
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Vehicle Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="text-xl font-bold mb-4">
              {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Vehicle ID</label>
                  <input 
                    type="text" 
                    value={formData.id} 
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g., BMW-002"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Vehicle Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., BMW 7 Series - BMW-002"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Vehicle Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Luxury Sedan">Luxury Sedan</option>
                    <option value="Executive SUV">Executive SUV</option>
                    <option value="Limousine">Limousine</option>
                    <option value="Minibus">Minibus</option>
                    <option value="Coach">Coach</option>
                    <option value="Luxury Coach">Luxury Coach</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Driver Rate (€/hr)</label>
                  <input 
                    type="number" 
                    value={formData.driverRate} 
                    onChange={e => setFormData({ ...formData, driverRate: parseFloat(e.target.value) || 0 })}
                    step="0.50"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Fuel Rate (€/mile)</label>
                  <input 
                    type="number" 
                    value={formData.fuelRate} 
                    onChange={e => setFormData({ ...formData, fuelRate: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Running Cost (€/mile)</label>
                  <input 
                    type="number" 
                    value={formData.runningCost} 
                    onChange={e => setFormData({ ...formData, runningCost: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Business Insurance/Day (€)</label>
                  <input 
                    type="number" 
                    value={formData.insuranceRate} 
                    onChange={e => setFormData({ ...formData, insuranceRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Capacity</label>
                  <input 
                    type="number" 
                    value={formData.capacity} 
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4 justify-end">
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingVehicle(null);
                    setFormData({ id: "", name: "", type: "Luxury Sedan", driverRate: 15, fuelRate: 0.45, runningCost: 0.25, insuranceRate: 25, capacity: 4 });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Running cost calculator modal (separate) */}
      {showRunningCostModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="text-xl font-bold mb-4">Running Cost Formula Calculator</h2>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); calculateRunningCost(); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Maintenance</label>
                  <input type="number" value={runningCostForm.maintenance} onChange={e => setRunningCostForm(f => ({ ...f, maintenance: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label>Depreciation</label>
                  <input type="number" value={runningCostForm.depreciation} onChange={e => setRunningCostForm(f => ({ ...f, depreciation: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label>Insurance</label>
                  <input type="number" value={runningCostForm.insurance} onChange={e => setRunningCostForm(f => ({ ...f, insurance: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label>Road Tax</label>
                  <input type="number" value={runningCostForm.roadTax} onChange={e => setRunningCostForm(f => ({ ...f, roadTax: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label>MOT/Inspections</label>
                  <input type="number" value={runningCostForm.mot} onChange={e => setRunningCostForm(f => ({ ...f, mot: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label>Cleaning</label>
                  <input type="number" value={runningCostForm.cleaning} onChange={e => setRunningCostForm(f => ({ ...f, cleaning: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label>Other</label>
                  <input type="number" value={runningCostForm.other} onChange={e => setRunningCostForm(f => ({ ...f, other: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label>Expected Annual Mileage</label>
                  <input type="number" value={runningCostForm.mileage} onChange={e => setRunningCostForm(f => ({ ...f, mileage: parseInt(e.target.value) }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-4">Calculate</button>
            </form>
            {runningCostResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div>Total Annual Cost: €{runningCostResult.totalAnnualCost.toFixed(2)}</div>
                <div>Cost Per Mile: <span className="font-bold text-green-600">€{runningCostResult.costPerMile.toFixed(3)}</span></div>
                <button className="btn btn-success mt-4" onClick={applyRunningCostToVehicle}>Apply to Vehicle</button>
              </div>
            )}
            <button className="btn btn-outline mt-4" onClick={() => setShowRunningCostModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}