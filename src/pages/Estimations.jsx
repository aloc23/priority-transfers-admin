import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  FilterIcon, 
  CheckIcon,
  BookingIcon,
  DownloadIcon
} from "../components/Icons";

export default function Estimations() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = {
      ...estimationForm,
      distance: Number(estimationForm.distance),
      estimatedDuration: Number(estimationForm.estimatedDuration),
      basePrice: Number(estimationForm.basePrice),
      additionalFees: Number(estimationForm.additionalFees),
      totalPrice: Number(estimationForm.basePrice) + Number(estimationForm.additionalFees)
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
    setEstimationForm({
      ...estimation,
      distance: estimation.distance.toString(),
      estimatedDuration: estimation.estimatedDuration.toString(),
      basePrice: estimation.basePrice.toString(),
      additionalFees: estimation.additionalFees.toString(),
      totalPrice: estimation.totalPrice.toString()
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this estimation?")) {
      deleteEstimation(id);
    }
  };

  const handleApprove = (id) => {
    updateEstimation(id, { status: 'approved' });
  };

  const handleConvert = (id) => {
    if (confirm("Convert this estimation to a booking?")) {
      const result = convertEstimationToBooking(id);
      if (result.success) {
        alert("Estimation successfully converted to booking!");
      } else {
        alert("Failed to convert estimation: " + result.error);
      }
    }
  };

  const calculateTotalPrice = () => {
    const base = Number(estimationForm.basePrice) || 0;
    const fees = Number(estimationForm.additionalFees) || 0;
    return base + fees;
  };

  const updateTotalPrice = () => {
    const total = calculateTotalPrice();
    setEstimationForm({...estimationForm, totalPrice: total});
  };

  const exportEstimations = () => {
    const headers = ['Date', 'Customer', 'From', 'To', 'Service Type', 'Total Price', 'Status', 'Valid Until'];
    const csvContent = [
      headers.join(','),
      ...filteredEstimations.map(est => [
        est.date,
        `"${est.customer}"`,
        `"${est.fromAddress}"`,
        `"${est.toAddress}"`,
        est.serviceType,
        est.totalPrice,
        est.status,
        est.validUntil
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Estimations & Quotes</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportEstimations}
            className="btn btn-outline flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Estimation
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <span className="text-lg font-bold">#</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <span className="text-lg font-bold">⏳</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <CheckIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <BookingIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
              <p className="text-sm text-gray-600">Converted</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-emerald-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <span className="text-lg font-bold">€</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{stats.totalValue.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-indigo-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <span className="text-lg font-bold">Ø</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{stats.averageValue.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Avg Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <FilterIcon className="w-5 h-5 text-gray-500" />
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

      {/* Estimations List */}
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
                  <td>
                    <div>
                      <div className="font-medium">{estimation.customer}</div>
                      <div className="text-xs text-gray-500">{estimation.customerEmail}</div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div>{estimation.fromAddress}</div>
                      <div className="text-gray-500">→ {estimation.toAddress}</div>
                      <div className="text-xs text-gray-400">{estimation.distance}km, ~{estimation.estimatedDuration}min</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className={`badge ${
                        estimation.serviceType === 'priority' ? 'badge-purple' :
                        estimation.serviceType === 'luxury' ? 'badge-gold' :
                        'badge-blue'
                      }`}>
                        {estimation.serviceType}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{estimation.vehicleType}</div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-green-600">€{estimation.totalPrice.toFixed(2)}</div>
                    {estimation.additionalFees > 0 && (
                      <div className="text-xs text-gray-500">
                        Base: €{estimation.basePrice} + €{estimation.additionalFees}
                      </div>
                    )}
                  </td>
                  <td>{estimation.validUntil}</td>
                  <td>
                    <span className={`badge ${
                      estimation.status === 'approved' ? 'badge-green' :
                      estimation.status === 'converted' ? 'badge-purple' :
                      estimation.status === 'pending' ? 'badge-yellow' :
                      'badge-red'
                    }`}>
                      {estimation.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {estimation.status === 'pending' && (
                        <button 
                          onClick={() => handleApprove(estimation.id)}
                          className="btn bg-green-600 text-white hover:bg-green-700 px-2 py-1 text-xs"
                          title="Approve"
                        >
                          <CheckIcon className="w-3 h-3" />
                        </button>
                      )}
                      {estimation.status === 'approved' && (
                        <button 
                          onClick={() => handleConvert(estimation.id)}
                          className="btn bg-purple-600 text-white hover:bg-purple-700 px-2 py-1 text-xs"
                          title="Convert to Booking"
                        >
                          <BookingIcon className="w-3 h-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(estimation)}
                        className="btn btn-outline px-2 py-1 text-xs"
                        title="Edit"
                      >
                        <EditIcon className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(estimation.id)}
                        className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                        title="Delete"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estimation Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-4xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingEstimation ? 'Edit Estimation' : 'New Estimation'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    value={estimationForm.customerEmail}
                    onChange={(e) => setEstimationForm({...estimationForm, customerEmail: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Address *
                  </label>
                  <input
                    type="text"
                    value={estimationForm.fromAddress}
                    onChange={(e) => setEstimationForm({...estimationForm, fromAddress: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Address *
                  </label>
                  <input
                    type="text"
                    value={estimationForm.toAddress}
                    onChange={(e) => setEstimationForm({...estimationForm, toAddress: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    value={estimationForm.distance}
                    onChange={(e) => setEstimationForm({...estimationForm, distance: e.target.value})}
                    className="form-input"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={estimationForm.estimatedDuration}
                    onChange={(e) => setEstimationForm({...estimationForm, estimatedDuration: e.target.value})}
                    className="form-input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <select
                    value={estimationForm.serviceType}
                    onChange={(e) => setEstimationForm({...estimationForm, serviceType: e.target.value})}
                    className="form-select"
                  >
                    <option value="standard">Standard</option>
                    <option value="priority">Priority</option>
                    <option value="luxury">Luxury</option>
                  </select>
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
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (€) *
                  </label>
                  <input
                    type="number"
                    value={estimationForm.basePrice}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, basePrice: e.target.value});
                      setTimeout(updateTotalPrice, 0);
                    }}
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Fees (€)
                  </label>
                  <input
                    type="number"
                    value={estimationForm.additionalFees}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, additionalFees: e.target.value});
                      setTimeout(updateTotalPrice, 0);
                    }}
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price (€)
                  </label>
                  <input
                    type="number"
                    value={calculateTotalPrice()}
                    className="form-input bg-gray-100"
                    readOnly
                  />
                </div>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={estimationForm.notes}
                    onChange={(e) => setEstimationForm({...estimationForm, notes: e.target.value})}
                    className="form-input"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingEstimation ? 'Update' : 'Create'} Estimation
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