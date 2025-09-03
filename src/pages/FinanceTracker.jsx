import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { formatCurrency, calculateRevenue, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { calculatePriceBreakdown, calculateTotalPrice, formatPriceBreakdown, getPricingConfiguration } from "../utils/priceCalculator";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  FilterIcon, 
  DownloadIcon,
  TrendUpIcon,
  TrendDownIcon,
  RevenueIcon, 
  InvoiceIcon, 
  ViewIcon, 
  SendIcon, 
  XIcon,
  CheckIcon,
  BookingIcon
} from "../components/Icons";

export default function FinanceTracker() {
  const { 
    // Estimations related
    estimations, 
    addEstimation, 
    updateEstimation, 
    deleteEstimation,
    convertEstimationToBooking,
    customers,
    drivers
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('estimations');
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [editingEstimation, setEditingEstimation] = useState(null);
  const [estimationFilters, setEstimationFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    serviceType: 'all'
  });

  const [estimationForm, setEstimationForm] = useState({
    customer: '',
    customerEmail: '',
    fromAddress: '',
    toAddress: '',
    distance: '',
    estimatedDuration: '',
    serviceType: 'priority',
    vehicleType: 'standard',
    basePrice: 45,
    additionalFees: 0,
    totalPrice: 45,
    validUntil: '',
    notes: '',
    status: 'pending'
  });

  // Filter estimations data
  const filteredEstimations = estimations.filter(estimation => {
    const estimationDate = new Date(estimation.date);
    const fromDate = estimationFilters.dateFrom ? new Date(estimationFilters.dateFrom) : null;
    const toDate = estimationFilters.dateTo ? new Date(estimationFilters.dateTo) : null;
    
    if (fromDate && estimationDate < fromDate) return false;
    if (toDate && estimationDate > toDate) return false;
    if (estimationFilters.status !== 'all' && estimation.status !== estimationFilters.status) return false;
    if (estimationFilters.serviceType !== 'all' && estimation.serviceType !== estimationFilters.serviceType) return false;
    
    return true;
  });

  // Calculate estimation statistics
  const estimationStats = {
    total: estimations.length,
    pending: estimations.filter(e => e.status === 'pending').length,
    approved: estimations.filter(e => e.status === 'approved').length,
    converted: estimations.filter(e => e.status === 'converted').length,
    totalValue: estimations.reduce((sum, e) => sum + e.totalPrice, 0),
    averageValue: estimations.length > 0 ? estimations.reduce((sum, e) => sum + e.totalPrice, 0) / estimations.length : 0
  };

  // Estimation handlers - using new price calculator
  const calculateEstimationTotalPrice = () => {
    const params = {
      distance: Number(estimationForm.distance) || 0,
      duration: Number(estimationForm.estimatedDuration) || 0,
      serviceType: estimationForm.serviceType || 'standard',
      vehicleType: estimationForm.vehicleType || 'standard',
      additionalFees: Number(estimationForm.additionalFees) || 0,
      manualBasePrice: Number(estimationForm.basePrice) || null
    };
    
    return calculateTotalPrice(params);
  };

  const updateTotalPrice = () => {
    const params = {
      distance: Number(estimationForm.distance) || 0,
      duration: Number(estimationForm.estimatedDuration) || 0,
      serviceType: estimationForm.serviceType || 'standard',
      vehicleType: estimationForm.vehicleType || 'standard',
      additionalFees: Number(estimationForm.additionalFees) || 0,
      manualBasePrice: Number(estimationForm.basePrice) || null
    };
    
    const breakdown = calculatePriceBreakdown(params);
    
    // Update form with calculated values
    if (params.distance > 0 || params.duration > 0) {
      setEstimationForm({
        ...estimationForm, 
        basePrice: breakdown.finalBasePrice.toFixed(2),
        totalPrice: breakdown.total
      });
    } else {
      setEstimationForm({...estimationForm, totalPrice: breakdown.total});
    }
  };

  const getEstimationPriceBreakdown = () => {
    const params = {
      distance: Number(estimationForm.distance) || 0,
      duration: Number(estimationForm.estimatedDuration) || 0,
      serviceType: estimationForm.serviceType || 'standard',
      vehicleType: estimationForm.vehicleType || 'standard',
      additionalFees: Number(estimationForm.additionalFees) || 0,
      manualBasePrice: Number(estimationForm.basePrice) || null
    };
    
    return calculatePriceBreakdown(params);
  };

  const handleEstimationSubmit = (e) => {
    e.preventDefault();
    
    const formData = {
      ...estimationForm,
      distance: Number(estimationForm.distance),
      estimatedDuration: Number(estimationForm.estimatedDuration),
      basePrice: Number(estimationForm.basePrice),
      additionalFees: Number(estimationForm.additionalFees),
      totalPrice: calculateEstimationTotalPrice()
    };
    
    if (editingEstimation) {
      const result = updateEstimation(editingEstimation.id, formData);
      if (result.success) {
        setShowEstimationModal(false);
        setEditingEstimation(null);
        resetEstimationForm();
      }
    } else {
      const result = addEstimation(formData);
      if (result.success) {
        setShowEstimationModal(false);
        resetEstimationForm();
      }
    }
  };

  const resetEstimationForm = () => {
    setEstimationForm({
      customer: '',
      customerEmail: '',
      fromAddress: '',
      toAddress: '',
      distance: '',
      estimatedDuration: '',
      serviceType: 'priority',
      vehicleType: 'standard',
      basePrice: 45,
      additionalFees: 0,
      totalPrice: 45,
      validUntil: '',
      notes: '',
      status: 'pending'
    });
  };

  const handleEstimationEdit = (estimation) => {
    setEditingEstimation(estimation);
    setEstimationForm(estimation);
    setShowEstimationModal(true);
  };

  const handleApprove = (id) => {
    updateEstimation(id, { status: 'approved' });
  };

  const handleConvert = (id) => {
    if (confirm("Convert this estimation to a booking?")) {
      const result = convertEstimationToBooking(id);
      if (result.success) {
        console.log("Estimation successfully converted to booking");
        // Success feedback would be handled by the store notification system
      } else {
        console.error("Failed to convert estimation:", result.error);
      }
    }
  };

  const handleDeleteEstimation = (id) => {
    if (confirm("Are you sure you want to delete this estimation?")) {
      deleteEstimation(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Price Calculator & Estimates</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowEstimationModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Save Estimation
          </button>
        </div>
      </div>

      {/* Estimation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{estimationStats.total}</div>
            <div className="text-xs text-slate-600">Total Estimates</div>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{estimationStats.pending}</div>
            <div className="text-xs text-slate-600">Pending</div>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{estimationStats.approved}</div>
            <div className="text-xs text-slate-600">Approved</div>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{estimationStats.converted}</div>
            <div className="text-xs text-slate-600">Converted</div>
          </div>
        </div>
      </div>

      {/* Price Calculator */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Price Calculator</h3>
          <div className="text-sm text-slate-500">
            {getEstimationPriceBreakdown().isPeakHour && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                Peak Hours (+25%)
              </span>
            )}
          </div>
        </div>
        
        {/* Route Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
            <input
              type="text"
              value={estimationForm.fromAddress}
              onChange={(e) => setEstimationForm({...estimationForm, fromAddress: e.target.value})}
              className="form-input"
              placeholder="Pickup location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Address</label>
            <input
              type="text"
              value={estimationForm.toAddress}
              onChange={(e) => setEstimationForm({...estimationForm, toAddress: e.target.value})}
              className="form-input"
              placeholder="Destination"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
            <input
              type="number"
              value={estimationForm.distance}
              onChange={(e) => {
                setEstimationForm({...estimationForm, distance: e.target.value});
                setTimeout(updateTotalPrice, 50);
              }}
              className="form-input"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
            <input
              type="number"
              value={estimationForm.estimatedDuration}
              onChange={(e) => {
                setEstimationForm({...estimationForm, estimatedDuration: e.target.value});
                setTimeout(updateTotalPrice, 50);
              }}
              className="form-input"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        
        {/* Service & Vehicle Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={estimationForm.serviceType}
              onChange={(e) => {
                setEstimationForm({...estimationForm, serviceType: e.target.value});
                setTimeout(updateTotalPrice, 50);
              }}
              className="form-select"
            >
              <option value="standard">Standard Transfer</option>
              <option value="priority">Priority Transfer</option>
              <option value="luxury">Luxury Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select
              value={estimationForm.vehicleType}
              onChange={(e) => {
                setEstimationForm({...estimationForm, vehicleType: e.target.value});
                setTimeout(updateTotalPrice, 50);
              }}
              className="form-select"
            >
              <option value="standard">Standard Car</option>
              <option value="premium">Premium SUV (+20%)</option>
              <option value="luxury">Luxury Vehicle (+50%)</option>
              <option value="van">Van/Minibus (+30%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (€)</label>
            <input
              type="number"
              value={estimationForm.basePrice}
              onChange={(e) => {
                setEstimationForm({...estimationForm, basePrice: e.target.value});
                setTimeout(updateTotalPrice, 50);
              }}
              className="form-input"
              min="0"
              step="0.01"
            />
            <div className="text-xs text-gray-500 mt-1">Auto-calculated from inputs</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Fees (€)</label>
            <input
              type="number"
              value={estimationForm.additionalFees}
              onChange={(e) => {
                setEstimationForm({...estimationForm, additionalFees: e.target.value});
                setTimeout(updateTotalPrice, 50);
              }}
              className="form-input"
              min="0"
              step="0.01"
            />
            <div className="text-xs text-gray-500 mt-1">Airport fees, tolls, etc.</div>
          </div>
        </div>
        
        {/* Price Breakdown */}
        {(estimationForm.distance || estimationForm.estimatedDuration) && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Price Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {(() => {
                const breakdown = getEstimationPriceBreakdown();
                const formatted = formatPriceBreakdown(breakdown);
                return (
                  <>
                    <div className="text-blue-800">
                      <div className="font-semibold">Base Rate</div>
                      <div>€{formatted.baseRate}</div>
                    </div>
                    <div className="text-blue-800">
                      <div className="font-semibold">Distance</div>
                      <div>€{formatted.distancePrice}</div>
                    </div>
                    <div className="text-blue-800">
                      <div className="font-semibold">Time</div>
                      <div>€{formatted.timePrice}</div>
                    </div>
                    <div className="text-blue-800">
                      <div className="font-semibold">Vehicle Adj.</div>
                      <div>€{formatted.vehicleAdjustment}</div>
                    </div>
                    {breakdown.peakSurcharge > 0 && (
                      <div className="text-orange-800">
                        <div className="font-semibold">Peak Hours</div>
                        <div>€{formatted.peakSurcharge}</div>
                      </div>
                    )}
                    <div className="text-green-800">
                      <div className="font-semibold">Driver Cost</div>
                      <div>€{formatted.driverCost}</div>
                    </div>
                    {breakdown.additionalFees > 0 && (
                      <div className="text-blue-800">
                        <div className="font-semibold">Additional</div>
                        <div>€{formatted.additionalFees}</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
        
        {/* Pricing Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Pricing Structure</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <div>
                <strong>Standard:</strong> €10 base + €2.0/km + €1.0/min
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <div>
                <strong>Priority:</strong> €15 base + €2.5/km + €1.2/min
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <div>
                <strong>Luxury:</strong> €25 base + €3.5/km + €1.8/min
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200">
            <div>
              <strong>Vehicle Multipliers:</strong> Premium (+20%), Luxury (+50%), Van (+30%)
            </div>
            <div>
              <strong>Peak Hours:</strong> 7-9 AM & 5-7 PM (+25% surcharge)
            </div>
            <div>
              <strong>Driver Rates:</strong> Standard (15%), Priority (18%), Luxury (20%)
            </div>
            <div>
              <strong>Components:</strong> Base + Distance + Time + Vehicle + Peak + Driver + Fees
            </div>
          </div>
        </div>
        
        {/* Total Price & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="text-lg font-semibold mb-2 sm:mb-0">
            Total Price: <span className="text-2xl text-purple-600">{formatCurrency(calculateEstimationTotalPrice())}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setEstimationForm({
                  ...estimationForm,
                  customer: '',
                  customerEmail: '',
                  fromAddress: '',
                  toAddress: '',
                  distance: '',
                  estimatedDuration: '',
                  basePrice: 45,
                  additionalFees: 0,
                  totalPrice: 45
                });
              }}
              className="btn btn-outline"
            >
              Reset
            </button>
            <button 
              onClick={() => setShowEstimationModal(true)}
              className="btn btn-primary"
              disabled={!estimationForm.fromAddress || !estimationForm.toAddress}
            >
              Save Estimation
            </button>
          </div>
        </div>
      </div>

      {/* Estimations List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Saved Estimations</h3>
          <div className="flex gap-2">
            <select
              value={estimationFilters.status}
              onChange={(e) => setEstimationFilters({...estimationFilters, status: e.target.value})}
              className="form-select text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Route</th>
                <th>Service</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEstimations.map((estimation) => (
                <tr key={estimation.id}>
                  <td className="font-medium">{estimation.customer}</td>
                  <td className="text-sm">{estimation.fromAddress} → {estimation.toAddress}</td>
                  <td>
                    <span className="badge badge-blue">
                      {estimation.serviceType}
                    </span>
                  </td>
                  <td className="font-bold">{formatCurrency(estimation.totalPrice)}</td>
                  <td>
                    <span className={`badge ${
                      estimation.status === 'approved' ? 'badge-green' :
                      estimation.status === 'converted' ? 'badge-purple' :
                      'badge-yellow'
                    }`}>
                      {estimation.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEstimationEdit(estimation)}
                        className="btn btn-outline px-2 py-1 text-xs"
                      >
                        <EditIcon className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEstimation(estimation.id)}
                        className="btn btn-outline px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                      {estimation.status === 'pending' && (
                        <button 
                          onClick={() => handleApprove(estimation.id)}
                          className="btn btn-primary px-2 py-1 text-xs"
                        >
                          Approve
                        </button>
                      )}
                      {estimation.status === 'approved' && (
                        <button 
                          onClick={() => handleConvert(estimation.id)}
                          className="btn btn-outline px-2 py-1 text-xs"
                        >
                          <BookingIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estimation Modal */}
      {showEstimationModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-3xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingEstimation ? 'Edit Estimation' : 'Save New Estimation'}
            </h3>
            <form onSubmit={handleEstimationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={estimationForm.customer}
                    onChange={(e) => setEstimationForm({...estimationForm, customer: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={estimationForm.customerEmail}
                    onChange={(e) => setEstimationForm({...estimationForm, customerEmail: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={estimationForm.validUntil}
                    onChange={(e) => setEstimationForm({...estimationForm, validUntil: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={estimationForm.vehicleType}
                    onChange={(e) => setEstimationForm({...estimationForm, vehicleType: e.target.value})}
                    className="form-select"
                  >
                    <option value="standard">Standard</option>
                    <option value="luxury">Luxury</option>
                    <option value="van">Van</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={estimationForm.notes}
                  onChange={(e) => setEstimationForm({...estimationForm, notes: e.target.value})}
                  className="form-input"
                  rows="3"
                  placeholder="Additional notes for the estimation..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingEstimation ? 'Update' : 'Save'} Estimation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEstimationModal(false);
                    setEditingEstimation(null);
                    resetEstimationForm();
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
