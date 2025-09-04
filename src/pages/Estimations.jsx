import { useEffect, useState } from "react";
import { useAppStore } from "../context/AppStore";
import { useFleet } from "../context/FleetContext";
import { calculateTotalPrice } from "../utils/priceCalculator";
import StatsCard from '../components/StatsCard';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  FilterIcon, 
  CheckIcon,
  BookingIcon,
  DownloadIcon,
  RevenueIcon,
  EstimationIcon,
  CloseIcon
} from "../components/Icons";

export default function Estimations() {

  // All hooks must be at the top
  const { income, expenses, invoices, estimations, refreshAllData } = useAppStore();
  const { fleet } = useFleet();
  const [showModal, setShowModal] = useState(false);
  const [editingEstimation, setEditingEstimation] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });
  // Example state for form and results (replace with your actual logic)
  const [form, setForm] = useState({
    serviceType: 'priority',
    vehicleId: '',
    distance: '',
    duration: '',
    passengers: 1,
    driverRate: '',
    fuelRate: '',
    runningCost: '',
    insuranceRate: '',
    additionalCosts: '',
    markupPercent: '',
    baseFee: '',
    minimumCharge: '',
    waitingTime: false,
    waitingHours: '',
    meetGreet: false,
    meetGreetPrice: '',
    refreshments: false,
    refreshmentsPrice: '',
    childSeats: false,
    childSeatCount: '',
    childSeatPrice: '',
  });
  const [results, setResults] = useState(null);
  // Local state for estimations list
  const [localEstimations, setLocalEstimations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const filteredEstimations = localEstimations;

  // Recalculate cost analysis when form changes
  useEffect(() => {
    // Only recalculate if required fields are present
    if (form.baseFee || form.additionalCosts || form.runningCost || form.fuelRate || form.driverRate) {
      const totalPrice = Number(form.baseFee || 0) + Number(form.additionalCosts || 0) + Number(form.runningCost || 0) + Number(form.fuelRate || 0) + Number(form.driverRate || 0);
      setResults({ finalPrice: totalPrice });
    }
  }, [form.baseFee, form.additionalCosts, form.runningCost, form.fuelRate, form.driverRate]);

  function handleVehicleSelect(e) {
    const vehicleId = e.target.value;
    const selectedVehicle = fleet?.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      setForm(form => ({
        ...form,
        vehicleId,
        runningCost: selectedVehicle.runningCost || '',
        fuelRate: selectedVehicle.fuelRate || '',
        driverRate: selectedVehicle.driverRate || '',
        // You can add more fields to prepopulate as needed
      }));
    } else {
      setForm(form => ({ ...form, vehicleId }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Calculate price (replace with your real logic)
    const totalPrice = Number(form.baseFee || 0) + Number(form.additionalCosts || 0);
    const newEstimation = {
      id: editingId || Date.now(),
      date: new Date().toLocaleDateString(),
      customer: 'Demo Customer',
      route: 'Demo Route',
      serviceType: form.serviceType,
      totalPrice,
      validUntil: '2025-12-31',
      status: 'pending',
      ...form,
    };
    if (editingId) {
      setLocalEstimations(localEstimations.map(est => est.id === editingId ? newEstimation : est));
      setEditingId(null);
    } else {
      setLocalEstimations([...localEstimations, newEstimation]);
    }
    setForm({
      serviceType: 'priority',
      vehicleId: '',
      distance: '',
      duration: '',
      passengers: 1,
      driverRate: '',
      fuelRate: '',
      runningCost: '',
      insuranceRate: '',
      additionalCosts: '',
      markupPercent: '',
      baseFee: '',
      minimumCharge: '',
      waitingTime: false,
      waitingHours: '',
      meetGreet: false,
      meetGreetPrice: '',
      refreshments: false,
      refreshmentsPrice: '',
      childSeats: false,
      childSeatCount: '',
      childSeatPrice: '',
    });
    setResults({ finalPrice: totalPrice });
  }
  function exportEstimations() {
    alert('Exporting estimations...');
  }
  function handleEdit(estimation) {
    setForm({ ...estimation });
    setEditingId(estimation.id);
  }
  function handleDelete(id) {
    setLocalEstimations(localEstimations.filter(est => est.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({
        serviceType: 'priority',
        vehicleId: '',
        distance: '',
        duration: '',
        passengers: 1,
        driverRate: '',
        fuelRate: '',
        runningCost: '',
        insuranceRate: '',
        additionalCosts: '',
        markupPercent: '',
        baseFee: '',
        minimumCharge: '',
        waitingTime: false,
        waitingHours: '',
        meetGreet: false,
        meetGreetPrice: '',
        refreshments: false,
        refreshmentsPrice: '',
        childSeats: false,
        childSeatCount: '',
        childSeatPrice: '',
      });
    }
  }
  function handleApprove(id) {
    setLocalEstimations(localEstimations.map(est => est.id === id ? { ...est, status: 'approved' } : est));
  }
  function handleConvert(id) {
    setLocalEstimations(localEstimations.map(est => est.id === id ? { ...est, status: 'converted' } : est));
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-end mb-4">
        <button className="btn btn-outline" onClick={refreshAllData}>Refresh Data</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6">
          <h2 className="text-xl font-bold mb-4">Job Details & Costs</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1">Service Type</label>
              <select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}>
                <option value="chauffeur">Chauffeur Service</option>
                <option value="priority">Priority</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Quick Select Vehicle</label>
                <select value={form.vehicleId} onChange={handleVehicleSelect}>
                <option value="">Select from fleet...</option>
                {fleet && fleet.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.name} ({vehicle.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Distance (miles)</label>
              <input type="number" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Duration (hours)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Passengers</label>
              <input type="number" value={form.passengers} onChange={e => setForm({ ...form, passengers: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Driver Rate (€/hour)</label>
              <input type="number" value={form.driverRate} onChange={e => setForm({ ...form, driverRate: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Fuel Cost (€/mile)</label>
              <input type="number" value={form.fuelRate} onChange={e => setForm({ ...form, fuelRate: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Vehicle Running Cost (€/mile)</label>
              <input type="number" value={form.runningCost} onChange={e => setForm({ ...form, runningCost: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Business Insurance/Day (€)</label>
              <input type="number" value={form.insuranceRate} onChange={e => setForm({ ...form, insuranceRate: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Additional Costs (€)</label>
              <input type="number" value={form.additionalCosts} onChange={e => setForm({ ...form, additionalCosts: e.target.value })} />
            </div>
            <div className="md:col-span-2 mt-6">
              <h3 className="font-semibold mb-2">Pricing Strategy</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Markup % (on costs)</label>
                  <input type="number" value={form.markupPercent} onChange={e => setForm({ ...form, markupPercent: e.target.value })} />
                </div>
                <div>
                  <label className="block mb-1">Base Fee (€)</label>
                  <input type="number" value={form.baseFee} onChange={e => setForm({ ...form, baseFee: e.target.value })} />
                </div>
                <div>
                  <label className="block mb-1">Minimum Charge (€)</label>
                  <input type="number" value={form.minimumCharge} onChange={e => setForm({ ...form, minimumCharge: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 mt-6">
              <h3 className="font-semibold mb-2">Additional Services</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label><input type="checkbox" checked={form.waitingTime} onChange={e => setForm({ ...form, waitingTime: e.target.checked })} /> Waiting Time</label>
                  <input type="number" value={form.waitingHours} onChange={e => setForm({ ...form, waitingHours: e.target.value })} placeholder="Hours" />
                </div>
                <div>
                  <label><input type="checkbox" checked={form.meetGreet} onChange={e => setForm({ ...form, meetGreet: e.target.checked })} /> Meet & Greet</label>
                  <input type="number" value={form.meetGreetPrice} onChange={e => setForm({ ...form, meetGreetPrice: e.target.value })} />
                </div>
                <div>
                  <label><input type="checkbox" checked={form.refreshments} onChange={e => setForm({ ...form, refreshments: e.target.checked })} /> Refreshments</label>
                  <input type="number" value={form.refreshmentsPrice} onChange={e => setForm({ ...form, refreshmentsPrice: e.target.value })} />
                </div>
                <div>
                  <label><input type="checkbox" checked={form.childSeats} onChange={e => setForm({ ...form, childSeats: e.target.checked })} /> Child Seats</label>
                  <input type="number" value={form.childSeatCount} onChange={e => setForm({ ...form, childSeatCount: e.target.value })} placeholder="Quantity" />
                  <input type="number" value={form.childSeatPrice} onChange={e => setForm({ ...form, childSeatPrice: e.target.value })} placeholder="Price" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2 pt-4 justify-end">
              <button type="submit" className="btn btn-primary shadow-md hover:shadow-lg">
                Save
              </button>
            </div>
          </form>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Cost Analysis</h3>
          {results && (
            <div>
              <div className="font-bold text-lg">Final Quote Price <span className="float-right text-green-600">€{results.finalPrice}</span></div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
        <button onClick={exportEstimations} className="btn btn-outline flex items-center gap-2">
          <DownloadIcon className="w-4 h-4" /> Export
        </button>
      </div>
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <FilterIcon className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="form-input text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="form-input text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="form-select text-sm">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="converted">Converted</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button className="btn btn-outline text-xs ml-auto" onClick={() => setFilters({ status: 'all', dateFrom: '', dateTo: '', serviceType: 'all' })}>Clear Filters</button>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Estimations ({filteredEstimations.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Service</th>
                <th>Price</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEstimations.map((estimation) => (
                <tr key={estimation.id}>
                  <td>{estimation.date}</td>
                  <td>{estimation.customer}</td>
                  <td>{estimation.route}</td>
                  <td>{estimation.serviceType}</td>
                  <td>€{estimation.totalPrice}</td>
                  <td>{estimation.validUntil}</td>
                  <td>{estimation.status}</td>
                  <td>
                    <button className="btn btn-outline px-2 py-1 text-xs" onClick={() => handleEdit(estimation)}>Edit</button>
                    <button className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs" onClick={() => handleDelete(estimation.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEstimations.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <EstimationIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No estimations found matching the current filters.</p>
            <p className="text-sm">Try clearing filters or adding a new estimation.</p>
          </div>
        )}
      </div>
    </div>
  );
}