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
    // Calculate detailed breakdown
    const distance = parseFloat(form.distance) || 0;
    const duration = parseFloat(form.duration) || 0;
    const passengers = parseInt(form.passengers) || 1;
    const driverRate = parseFloat(form.driverRate) || 0;
    const fuelRate = parseFloat(form.fuelRate) || 0;
    const runningCost = parseFloat(form.runningCost) || 0;
    const insuranceRate = parseFloat(form.insuranceRate) || 0;
    const baseFee = parseFloat(form.baseFee) || 0;
    const additionalCosts = parseFloat(form.additionalCosts) || 0;
    const markupPercent = parseFloat(form.markupPercent) || 0;
    const minimumCharge = parseFloat(form.minimumCharge) || 0;

    // Additional services
    const waitingHours = form.waitingTime ? parseFloat(form.waitingHours) || 0 : 0;
    const meetGreetPrice = form.meetGreet ? parseFloat(form.meetGreetPrice) || 0 : 0;
    const refreshmentsPrice = form.refreshments ? parseFloat(form.refreshmentsPrice) || 0 : 0;
    const childSeatsTotal = form.childSeats ? (parseFloat(form.childSeatCount) || 0) * (parseFloat(form.childSeatPrice) || 0) : 0;

    // Calculate base costs
    const driverCost = duration * driverRate;
    const fuelCost = distance * fuelRate;
    const vehicleRunningCost = distance * runningCost;
    const insuranceCost = insuranceRate; // Daily rate
    const waitingCost = waitingHours * driverRate;

    // Total variable costs
    const totalVariableCosts = driverCost + fuelCost + vehicleRunningCost + insuranceCost + waitingCost + additionalCosts;
    
    // Additional services total
    const totalAdditionalServices = meetGreetPrice + refreshmentsPrice + childSeatsTotal;
    
    // Apply markup
    const markupAmount = (totalVariableCosts * markupPercent) / 100;
    
    // Calculate final price
    const calculatedPrice = baseFee + totalVariableCosts + totalAdditionalServices + markupAmount;
    const finalPrice = Math.max(calculatedPrice, minimumCharge);

    setResults({
      distance,
      duration,
      passengers,
      driverCost: driverCost.toFixed(2),
      fuelCost: fuelCost.toFixed(2),
      vehicleRunningCost: vehicleRunningCost.toFixed(2),
      insuranceCost: insuranceCost.toFixed(2),
      waitingCost: waitingCost.toFixed(2),
      totalVariableCosts: totalVariableCosts.toFixed(2),
      baseFee: baseFee.toFixed(2),
      totalAdditionalServices: totalAdditionalServices.toFixed(2),
      markupAmount: markupAmount.toFixed(2),
      calculatedPrice: calculatedPrice.toFixed(2),
      minimumCharge: minimumCharge.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      isMinimumApplied: finalPrice === minimumCharge && minimumCharge > 0
    });
  }, [form.distance, form.duration, form.passengers, form.baseFee, form.additionalCosts, form.runningCost, form.fuelRate, form.driverRate, form.insuranceRate, form.markupPercent, form.minimumCharge, form.waitingTime, form.waitingHours, form.meetGreet, form.meetGreetPrice, form.refreshments, form.refreshmentsPrice, form.childSeats, form.childSeatCount, form.childSeatPrice]);

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
    // Use calculated price from results or fallback calculation
    const totalPrice = results?.finalPrice ? parseFloat(results.finalPrice) : (Number(form.baseFee || 0) + Number(form.additionalCosts || 0));
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
    setResults(null);
  }
  function exportEstimations() {
    try {
      if (filteredEstimations.length === 0) {
        alert('No estimations to export. Please create some estimations first.');
        return;
      }

      // Define CSV headers
      const headers = [
        'Date', 'Customer', 'Route', 'Service Type', 'Distance (miles)', 
        'Duration (hours)', 'Passengers', 'Total Price (€)', 'Valid Until', 'Status'
      ];

      // Convert estimations to CSV format
      const csvContent = [
        headers.join(','),
        ...filteredEstimations.map(est => [
          est.date || '',
          `"${est.customer || 'Demo Customer'}"`,
          `"${est.route || 'Demo Route'}"`,
          est.serviceType || '',
          est.distance || '',
          est.duration || '',
          est.passengers || '',
          est.totalPrice || results?.finalPrice || '',
          est.validUntil || '',
          est.status || ''
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `estimations-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Success feedback
      setTimeout(() => {
        alert(`Successfully exported ${filteredEstimations.length} estimations to CSV file.`);
      }, 100);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      {/* Streamlined Header */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Estimates & Quotes</h1>
            <p className="text-gray-600 text-sm md:text-base">Calculate accurate pricing for your transfer services</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline text-sm" onClick={refreshAllData}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button className="btn btn-primary text-sm" onClick={exportEstimations}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content: Side-by-side EstimateForm and Live Cost Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* EstimateForm Section */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 md:p-3 rounded-lg mr-3 md:mr-4">
                  <EstimationIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Estimate Form</h2>
                  <p className="text-sm text-gray-600">Enter service details for pricing</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select className="form-select w-full" value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}>
                <option value="chauffeur">Chauffeur Service</option>
                <option value="priority">Priority</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Select Vehicle</label>
                <select className="form-select w-full" value={form.vehicleId} onChange={handleVehicleSelect}>
                <option value="">Select from fleet...</option>
                {fleet && fleet.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.name} ({vehicle.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (miles)</label>
              <input className="form-input w-full" type="number" step="0.1" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input className="form-input w-full" type="number" step="0.1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
              <input className="form-input w-full" type="number" min="1" value={form.passengers} onChange={e => setForm({ ...form, passengers: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Rate (€/hour)</label>
              <input className="form-input w-full" type="number" step="0.01" value={form.driverRate} onChange={e => setForm({ ...form, driverRate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Cost (€/mile)</label>
              <input className="form-input w-full" type="number" step="0.01" value={form.fuelRate} onChange={e => setForm({ ...form, fuelRate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Running Cost (€/mile)</label>
              <input className="form-input w-full" type="number" step="0.01" value={form.runningCost} onChange={e => setForm({ ...form, runningCost: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance/Day (€)</label>
              <input className="form-input w-full" type="number" step="0.01" value={form.insuranceRate} onChange={e => setForm({ ...form, insuranceRate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Costs (€)</label>
              <input className="form-input w-full" type="number" step="0.01" value={form.additionalCosts} onChange={e => setForm({ ...form, additionalCosts: e.target.value })} />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Pricing Strategy</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Markup %</label>
                  <input className="form-input w-full" type="number" step="0.1" value={form.markupPercent} onChange={e => setForm({ ...form, markupPercent: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Fee (€)</label>
                  <input className="form-input w-full" type="number" step="0.01" value={form.baseFee} onChange={e => setForm({ ...form, baseFee: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Charge (€)</label>
                  <input className="form-input w-full" type="number" step="0.01" value={form.minimumCharge} onChange={e => setForm({ ...form, minimumCharge: e.target.value })} />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 pt-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Additional Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" checked={form.waitingTime} onChange={e => setForm({ ...form, waitingTime: e.target.checked })} />
                    Waiting Time (hours)
                  </label>
                  <input className="form-input flex-1" type="number" step="0.1" placeholder="Hours" value={form.waitingHours} onChange={e => setForm({ ...form, waitingHours: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" checked={form.meetGreet} onChange={e => setForm({ ...form, meetGreet: e.target.checked })} />
                    Meet & Greet (€)
                  </label>
                  <input className="form-input flex-1" type="number" step="0.01" placeholder="Price" value={form.meetGreetPrice} onChange={e => setForm({ ...form, meetGreetPrice: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" checked={form.refreshments} onChange={e => setForm({ ...form, refreshments: e.target.checked })} />
                    Refreshments (€)
                  </label>
                  <input className="form-input flex-1" type="number" step="0.01" placeholder="Price" value={form.refreshmentsPrice} onChange={e => setForm({ ...form, refreshmentsPrice: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" checked={form.childSeats} onChange={e => setForm({ ...form, childSeats: e.target.checked })} />
                    Child Seats
                  </label>
                  <input className="form-input w-16" type="number" min="1" placeholder="Qty" value={form.childSeatCount} onChange={e => setForm({ ...form, childSeatCount: e.target.value })} />
                  <span className="text-sm text-gray-500">×</span>
                  <input className="form-input flex-1" type="number" step="0.01" placeholder="Price" value={form.childSeatPrice} onChange={e => setForm({ ...form, childSeatPrice: e.target.value })} />
                </div>
              </div>
            </div>
            
              <div className="md:col-span-2 flex justify-end pt-6">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Estimate' : 'Save Estimate'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
        
        {/* Live Cost Analysis Section */}
        <div className="xl:col-span-1">
          <div className="xl:sticky xl:top-4">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 md:p-3 rounded-lg mr-3 md:mr-4">
                  <RevenueIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">Live Cost Analysis</h3>
                  <p className="text-xs md:text-sm text-gray-600">Real-time breakdown</p>
                </div>
              </div>
              
          {results ? (
            <div className="space-y-3 md:space-y-4">
              {/* Service Summary */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Service Summary</h4>
                <div className="text-xs md:text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <span className="font-medium">{results.distance} miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{results.duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span className="font-medium">{results.passengers}</span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 text-sm">Cost Breakdown</h4>
                <div className="text-xs md:text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Driver Cost:</span>
                    <span className="font-medium">€{results.driverCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Cost:</span>
                    <span className="font-medium">€{results.fuelCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Running:</span>
                    <span className="font-medium">€{results.vehicleRunningCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance/Day:</span>
                    <span className="font-medium">€{results.insuranceCost}</span>
                  </div>
                  {parseFloat(results.waitingCost) > 0 && (
                    <div className="flex justify-between">
                      <span>Waiting Time:</span>
                      <span className="font-medium">€{results.waitingCost}</span>
                    </div>
                  )}
                  <div className="border-t pt-1 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Variable Costs:</span>
                      <span>€{results.totalVariableCosts}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 text-sm">Pricing Summary</h4>
                <div className="text-xs md:text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Base Fee:</span>
                    <span className="font-medium">€{results.baseFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variable Costs:</span>
                    <span className="font-medium">€{results.totalVariableCosts}</span>
                  </div>
                  {parseFloat(results.totalAdditionalServices) > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Services:</span>
                      <span className="font-medium">€{results.totalAdditionalServices}</span>
                    </div>
                  )}
                  {parseFloat(results.markupAmount) > 0 && (
                    <div className="flex justify-between">
                      <span>Markup:</span>
                      <span className="font-medium">€{results.markupAmount}</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-base md:text-lg font-bold text-green-700">
                    <span>Final Quote:</span>
                    <span>€{results.finalPrice}</span>
                  </div>
                  {results.isMinimumApplied && (
                    <p className="text-xs text-orange-600 mt-1">
                      * Minimum charge applied (€{results.minimumCharge})
                    </p>
                  )}
                </div>
              </div>
            </div>
            ) : (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <EstimationIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs md:text-sm">Fill in the form to see live cost analysis</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Estimates List Section */}
      <div className="mt-6 md:mt-8">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            <div className="flex flex-wrap items-center gap-3">
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
              <button className="btn btn-outline text-xs" onClick={() => setFilters({ status: 'all', dateFrom: '', dateTo: '' })}>Clear Filters</button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Saved Estimates ({filteredEstimations.length})</h2>
              <button onClick={exportEstimations} className="btn btn-outline btn-sm flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-left">Date</th>
                  <th className="text-left">Customer</th>
                  <th className="text-left">Service</th>
                  <th className="text-left">Price</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstimations.map((estimation) => (
                  <tr key={estimation.id} className="border-b border-gray-100">
                    <td className="py-3">{estimation.date}</td>
                    <td className="py-3">{estimation.customer || 'Demo Customer'}</td>
                    <td className="py-3">
                      <span className={`badge text-xs ${
                        estimation.serviceType === 'priority' ? 'badge-purple' :
                        estimation.serviceType === 'luxury' ? 'badge-yellow' : 'badge-gray'
                      }`}>
                        {estimation.serviceType}
                      </span>
                    </td>
                    <td className="py-3 font-medium">€{estimation.totalPrice?.toFixed(2) || '0.00'}</td>
                    <td className="py-3">
                      <span className={`badge text-xs ${
                        estimation.status === 'pending' ? 'badge-yellow' :
                        estimation.status === 'approved' ? 'badge-green' :
                        estimation.status === 'converted' ? 'badge-purple' : 'badge-gray'
                      }`}>
                        {estimation.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="btn btn-outline btn-sm text-xs" onClick={() => handleEdit(estimation)}>Edit</button>
                        <button className="btn btn-outline btn-sm text-xs text-red-600 hover:bg-red-50" onClick={() => handleDelete(estimation.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEstimations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <EstimationIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-base">No estimates found</p>
                <p className="text-sm">Create your first estimate using the form above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}