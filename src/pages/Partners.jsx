import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { OutsourceIcon, SuccessIcon, PlusIcon, EditIcon, TrashIcon, FilterIcon } from "../components/Icons";

export default function Partners() {
  const { 
    partners, 
    addPartner, 
    updatePartner, 
    deletePartner,
    bookings
  } = useAppStore();

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all'
  });

  const [partnerForm, setPartnerForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
    commissionRate: 15,
    paymentTerms: "NET30",
    contractStart: "",
    contractEnd: ""
  });

  // Get outsourced bookings for partner statistics
  const outsourcedBookings = bookings.filter(booking => booking.type === "outsourced");

  // Calculate partner stats
  const partnerStats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === "active").length,
    totalRevenue: partners.reduce((sum, p) => sum + (p.totalRevenue || 0), 0),
    avgRating: partners.length > 0 ? 
      partners.reduce((sum, p) => sum + (p.rating || 0), 0) / partners.length : 0
  };

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    
    if (editingPartner) {
      const result = updatePartner(editingPartner.id, partnerForm);
      if (result.success) {
        setShowPartnerModal(false);
        setEditingPartner(null);
        resetPartnerForm();
      }
    } else {
      const result = addPartner(partnerForm);
      if (result.success) {
        setShowPartnerModal(false);
        resetPartnerForm();
      }
    }
  };

  const resetPartnerForm = () => {
    setPartnerForm({
      name: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      status: "active",
      commissionRate: 15,
      paymentTerms: "NET30",
      contractStart: "",
      contractEnd: ""
    });
  };

  const handleEditPartner = (partner) => {
    setEditingPartner(partner);
    setPartnerForm({...partner});
    setShowPartnerModal(true);
  };

  const handleDeletePartner = (partnerId) => {
    if (confirm('Are you sure you want to remove this partner? This action cannot be undone.')) {
      const result = deletePartner(partnerId);
      if (!result.success) {
        alert('Failed to remove partner: ' + result.error);
      }
    }
  };

  // Filter partners based on current filters
  const filteredPartners = partners.filter(partner => {
    const statusMatch = filters.status === 'all' || partner.status === filters.status;
    return statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-gray-600">Manage outsourced transfer partners and their contracts</p>
        </div>
        <button
          onClick={() => setShowPartnerModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <OutsourceIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{partnerStats.totalPartners}</p>
              <p className="text-sm text-gray-600">Total Partners</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <SuccessIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{partnerStats.activePartners}</p>
              <p className="text-sm text-gray-600">Active Partners</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <OutsourceIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outsourcedBookings.length}</p>
              <p className="text-sm text-gray-600">Outsourced Bookings</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <SuccessIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{partnerStats.totalRevenue}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="form-select text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Partners Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Partner Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Commission Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.id}>
                  <td className="font-medium">{partner.name}</td>
                  <td>{partner.contact}</td>
                  <td>{partner.email}</td>
                  <td>{partner.phone}</td>
                  <td>{partner.commissionRate}%</td>
                  <td>
                    <span className={`badge ${
                      partner.status === 'active' ? 'badge-green' :
                      partner.status === 'inactive' ? 'badge-red' :
                      'badge-yellow'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditPartner(partner)}
                        className="btn btn-outline px-2 py-1 text-xs"
                        title="Edit Partner"
                      >
                        <EditIcon className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeletePartner(partner.id)}
                        className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                        title="Remove Partner"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPartners.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No partners found. Click "Add Partner" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Partner Modal */}
      {showPartnerModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </h3>
              <button
                onClick={() => {
                  setShowPartnerModal(false);
                  setEditingPartner(null);
                  resetPartnerForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handlePartnerSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Name *
                  </label>
                  <input
                    type="text"
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({...partnerForm, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={partnerForm.contact}
                    onChange={(e) => setPartnerForm({...partnerForm, contact: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({...partnerForm, email: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={partnerForm.address}
                    onChange={(e) => setPartnerForm({...partnerForm, address: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={partnerForm.commissionRate}
                    onChange={(e) => setPartnerForm({...partnerForm, commissionRate: parseFloat(e.target.value)})}
                    className="form-input"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={partnerForm.status}
                    onChange={(e) => setPartnerForm({...partnerForm, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={partnerForm.paymentTerms}
                    onChange={(e) => setPartnerForm({...partnerForm, paymentTerms: e.target.value})}
                    className="form-select"
                  >
                    <option value="NET30">NET 30</option>
                    <option value="NET15">NET 15</option>
                    <option value="NET7">NET 7</option>
                    <option value="COD">Cash on Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Start
                  </label>
                  <input
                    type="date"
                    value={partnerForm.contractStart}
                    onChange={(e) => setPartnerForm({...partnerForm, contractStart: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract End
                  </label>
                  <input
                    type="date"
                    value={partnerForm.contractEnd}
                    onChange={(e) => setPartnerForm({...partnerForm, contractEnd: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingPartner ? 'Update' : 'Add'} Partner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPartnerModal(false);
                    setEditingPartner(null);
                    resetPartnerForm();
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