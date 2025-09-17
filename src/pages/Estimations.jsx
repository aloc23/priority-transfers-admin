import { useEffect, useState } from "react";
// Google Maps DirectionsService for journey estimation
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
  // State for journey info (distance/duration/error)
  const [journeyInfo, setJourneyInfo] = useState({ distance: '', duration: '', error: '' });
  // Google Maps script loader (shared with BookingModal)
  function loadGoogleMapsScript(apiKey, callback) {
    if (window.google && window.google.maps) {
      callback();
      return;
    }
    const existingScript = document.getElementById('googleMapsScript');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.id = 'googleMapsScript';
      script.async = true;
      script.onload = callback;
      document.body.appendChild(script);
    } else {
      existingScript.onload = callback;
    }
  }

  // Fetch journey info using DirectionsService
  function fetchJourneyInfo(pickup, destination) {
    if (!pickup || !destination) return;
    const apiKey = 'AIzaSyDoCk3Y84BUdtuOQNNjSm7rPOOZzenrkkw'; // <-- Your API key
    loadGoogleMapsScript(apiKey, () => {
      if (!(window.google && window.google.maps && window.google.maps.DirectionsService)) {
        setJourneyInfo({ distance: '', duration: '', error: 'Google Maps failed to load.' });
        return;
      }
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickup,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result.routes.length > 0) {
            const leg = result.routes[0].legs[0];
            setJourneyInfo({
              distance: leg.distance.text,
              duration: leg.duration.text,
              error: ''
            });
            // Optionally auto-fill form fields
            setForm(form => ({
              ...form,
              distance: leg.distance.value ? (leg.distance.value / 1609.34).toFixed(2) : '', // meters to miles
              duration: leg.duration.value ? (leg.duration.value / 3600).toFixed(2) : '' // seconds to hours
            }));
          } else {
            setJourneyInfo({ distance: '', duration: '', error: 'No route found.' });
          }
        }
      );
    });
  }
  // Pickup and destination fields for estimation
  const [locations, setLocations] = useState({ pickup: '', destination: '' });

  // Fetch journey info when pickup or destination changes
  useEffect(() => {
    if (locations.pickup && locations.destination) {
      fetchJourneyInfo(locations.pickup, locations.destination);
    } else {
      setJourneyInfo({ distance: '', duration: '', error: '' });
    }
    // eslint-disable-next-line
  }, [locations.pickup, locations.destination]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      {/* Header Section */}
  <div className="bg-white rounded-2xl shadow-lg mb-8 p-6 transition-shadow duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Estimates & Quotes</h1>
            <p className="text-gray-600">Calculate accurate pricing for your transfer services</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline hover:scale-105 transition-transform" onClick={refreshAllData}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
            <button className="btn btn-primary hover:scale-105 transition-transform" onClick={exportEstimations}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export All
            </button>
          </div>
        </div>
      </div>
      {/* Job Details Card - Now at the top */}
  <div className="bg-white rounded-2xl shadow-lg mb-8 transition-shadow duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <EstimationIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Job Details & Costs</h2>
              <p className="text-gray-600">Enter service parameters for accurate pricing</p>
            </div>
          </div>
        </div>

        {/* Form and Cost Analysis Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 p-4 lg:p-8">
          <div className="lg:col-span-2">
            {/* Form Content */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6 estimation-form-mobile" onSubmit={handleSubmit}>
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
              <label className="block mb-1">Pickup Location</label>
              <input type="text" value={locations.pickup} onChange={e => setLocations(l => ({ ...l, pickup: e.target.value }))} placeholder="Enter pickup address..." />
            </div>
            <div>
              <label className="block mb-1">Destination</label>
              <input type="text" value={locations.destination} onChange={e => setLocations(l => ({ ...l, destination: e.target.value }))} placeholder="Enter destination address..." />
            </div>
            <div>
              <label className="block mb-1">Distance (miles)</label>
              <input type="number" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Duration (hours)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            {/* Journey Info Display */}
            {(journeyInfo.distance || journeyInfo.duration || journeyInfo.error) && (
              <div className="col-span-2 mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                <span className="font-semibold text-blue-800">Journey Estimate:</span>
                {journeyInfo.error ? (
                  <span className="text-red-500 ml-2">{journeyInfo.error}</span>
                ) : (
                  <>
                    {journeyInfo.distance && <span className="ml-2">Distance: <b>{journeyInfo.distance}</b></span>}
                    {journeyInfo.duration && <span className="ml-4">Duration: <b>{journeyInfo.duration}</b></span>}
                  </>
                )}
              </div>
            )}
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

          <div className="lg:col-span-1">
            {/* Live Cost Analysis - Now positioned side by side */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 lg:p-6 h-fit">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <RevenueIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Live Cost Analysis</h3>
                  <p className="text-sm text-gray-600">Real-time pricing breakdown</p>
                </div>
              </div>
          {results ? (
            <div className="space-y-4">
              {/* Service Summary */}
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-gray-700 mb-2">Service Summary</h4>
                <div className="text-sm space-y-1">
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
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Cost Breakdown</h4>
                <div className="text-sm space-y-1">
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
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg border border-green-300">
                <h4 className="font-medium text-green-800 mb-2">Pricing Summary</h4>
                <div className="text-sm space-y-1">
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
                <div className="border-t border-green-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-green-700">
                    <span>Final Quote Price:</span>
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
            <div className="text-center py-8 text-gray-500">
              <EstimationIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Fill in the form to see live cost analysis</p>
            </div>
          )}
        </div>
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
    </div>
  );
}