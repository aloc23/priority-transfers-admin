import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { calculateTotalPrice, calculatePriceBreakdown } from "../utils/priceCalculator";
import { formatCurrency } from "../utils/currency";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  FilterIcon, 
  CheckIcon,
  BookingIcon,
  DownloadIcon,
  EstimationIcon
} from "../components/Icons";

export default function EstimationsOnly() {
  const { 
    estimations, 
    addEstimation, 
    updateEstimation, 
    deleteEstimation,
    convertEstimationToBooking,
    customers,
    drivers
  } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [editingEstimation, setEditingEstimation] = useState(null);
  const [filters, setFilters] = useState({
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

  // Filter estimations
  const filteredEstimations = estimations.filter(estimation => {
    const estimationDate = new Date(estimation.date);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    
    if (fromDate && estimationDate < fromDate) return false;
    if (toDate && estimationDate > toDate) return false;
    if (filters.status !== 'all' && estimation.status !== filters.status) return false;
    if (filters.serviceType !== 'all' && estimation.serviceType !== filters.serviceType) return false;
    
    return true;
  });

  // Calculate statistics
  const stats = {
    total: estimations.length,
    pending: estimations.filter(e => e.status === 'pending').length,
    approved: estimations.filter(e => e.status === 'approved').length,
    converted: estimations.filter(e => e.status === 'converted').length,
    totalValue: estimations.reduce((sum, e) => sum + e.totalPrice, 0),
    averageValue: estimations.length > 0 ? estimations.reduce((sum, e) => sum + e.totalPrice, 0) / estimations.length : 0
  };

  // Price calculation
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

  // Form handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = {
      ...estimationForm,
      distance: Number(estimationForm.distance),
      estimatedDuration: Number(estimationForm.estimatedDuration),
      basePrice: Number(estimationForm.basePrice),
      additionalFees: Number(estimationForm.additionalFees),
      totalPrice: calculateEstimationTotalPrice(),
      date: new Date().toISOString().split('T')[0]
    };
    
    if (editingEstimation) {
      const result = updateEstimation(editingEstimation.id, formData);
      if (result.success) {
        setShowModal(false);
        setEditingEstimation(null);
        resetForm();
      }
    } else {
      const result = addEstimation(formData);
      if (result.success) {
        setShowModal(false);
        resetForm();
      }
    }
  };

  const resetForm = () => {
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

  const handleEdit = (estimation) => {
    setEditingEstimation(estimation);
    setEstimationForm({...estimation, 
      distance: estimation.distance?.toString() || '',
      estimatedDuration: estimation.estimatedDuration?.toString() || '',
      basePrice: estimation.basePrice?.toString() || '45',
      additionalFees: estimation.additionalFees?.toString() || '0'
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this estimation?')) {
      deleteEstimation(id);
    }
  };

  const handleApprove = (id) => {
    updateEstimation(id, { status: 'approved' });
  };

  const handleConvert = (id) => {
    if (window.confirm("Convert this estimation to a booking?")) {
      const result = convertEstimationToBooking(id);
      if (result.success) {
        console.log("Estimation successfully converted to booking");
      } else {
        console.error("Failed to convert estimation:", result.error);
      }
    }
  };

  // Update total price when form values change
  const updateTotalPrice = () => {
    const newTotal = calculateEstimationTotalPrice();
    setEstimationForm(prev => ({...prev, totalPrice: newTotal}));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Price Estimations</h1>
          <p className="text-slate-600">Manage price estimates and convert them to bookings</p>
        </div>
        <button 
          onClick={() => {
            setEditingEstimation(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Estimation
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 text-white mr-4">
              <EstimationIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600">Total Estimations</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3 text-white mr-4">
              <span className="text-lg font-bold">⏳</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-slate-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white mr-4">
              <CheckIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-slate-600">Approved</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 text-white mr-4">
              <BookingIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.converted}</p>
              <p className="text-sm text-slate-600">Converted</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-emerald-500 rounded-lg p-3 text-white mr-4">
              <span className="text-lg font-bold">€</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalValue)}</p>
              <p className="text-sm text-slate-600">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="form-input text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="form-input text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="form-select text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="converted">Converted</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Service:</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
              className="form-select text-sm"
            >
              <option value="all">All</option>
              <option value="priority">Priority</option>
              <option value="standard">Standard</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estimations Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-slate-900">Estimations ({filteredEstimations.length})</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
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
                {filteredEstimations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="text-slate-500">
                        <EstimationIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No estimations found</p>
                        <p className="text-sm">Create your first estimation to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEstimations.map((estimation) => (
                    <tr key={estimation.id}>
                      <td>
                        <div>
                          <div className="font-medium text-slate-900">{estimation.customer}</div>
                          <div className="text-sm text-slate-500">{estimation.customerEmail}</div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium">{estimation.fromAddress}</div>
                          <div className="text-slate-500">→ {estimation.toAddress}</div>
                          <div className="text-xs text-slate-400">
                            {estimation.distance}km • {estimation.estimatedDuration}min
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          estimation.serviceType === 'priority' ? 'badge-purple' :
                          estimation.serviceType === 'luxury' ? 'badge-yellow' : 'badge-gray'
                        }`}>
                          {estimation.serviceType}
                        </span>
                      </td>
                      <td>
                        <div className="font-medium">{formatCurrency(estimation.totalPrice)}</div>
                        {estimation.additionalFees > 0 && (
                          <div className="text-xs text-slate-500">
                            +{formatCurrency(estimation.additionalFees)} fees
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="text-sm">
                          {estimation.validUntil ? new Date(estimation.validUntil).toLocaleDateString() : 'No expiry'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          estimation.status === 'pending' ? 'badge-yellow' :
                          estimation.status === 'approved' ? 'badge-green' :
                          estimation.status === 'converted' ? 'badge-purple' :
                          estimation.status === 'expired' ? 'badge-red' : 'badge-gray'
                        }`}>
                          {estimation.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(estimation)}
                            className="btn btn-outline px-2 py-1 text-xs"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete(estimation.id)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Estimation Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-4xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingEstimation ? 'Edit Estimation' : 'Create New Estimation'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={estimationForm.customer}
                    onChange={(e) => setEstimationForm({...estimationForm, customer: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={estimationForm.customerEmail}
                    onChange={(e) => setEstimationForm({...estimationForm, customerEmail: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
                  <input
                    type="text"
                    value={estimationForm.fromAddress}
                    onChange={(e) => setEstimationForm({...estimationForm, fromAddress: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Address</label>
                  <input
                    type="text"
                    value={estimationForm.toAddress}
                    onChange={(e) => setEstimationForm({...estimationForm, toAddress: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={estimationForm.distance}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, distance: e.target.value});
                      setTimeout(updateTotalPrice, 100);
                    }}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={estimationForm.estimatedDuration}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, estimatedDuration: e.target.value});
                      setTimeout(updateTotalPrice, 100);
                    }}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    value={estimationForm.serviceType}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, serviceType: e.target.value});
                      setTimeout(updateTotalPrice, 100);
                    }}
                    className="form-select"
                  >
                    <option value="standard">Standard</option>
                    <option value="priority">Priority</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={estimationForm.vehicleType}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, vehicleType: e.target.value});
                      setTimeout(updateTotalPrice, 100);
                    }}
                    className="form-select"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={estimationForm.basePrice}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, basePrice: e.target.value});
                      setTimeout(updateTotalPrice, 100);
                    }}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Fees (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={estimationForm.additionalFees}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, additionalFees: e.target.value});
                      setTimeout(updateTotalPrice, 100);
                    }}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={estimationForm.totalPrice}
                    onChange={(e) => setEstimationForm({...estimationForm, totalPrice: Number(e.target.value)})}
                    className="form-input"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={estimationForm.validUntil}
                    onChange={(e) => setEstimationForm({...estimationForm, validUntil: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={estimationForm.status}
                    onChange={(e) => setEstimationForm({...estimationForm, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="converted">Converted</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={estimationForm.notes}
                  onChange={(e) => setEstimationForm({...estimationForm, notes: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  placeholder="Additional notes or special requirements..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingEstimation ? 'Update Estimation' : 'Create Estimation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEstimation(null);
                    resetForm();
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