import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { OutsourceIcon, SuccessIcon, BookingIcon, PlusIcon, EditIcon, TrashIcon, FilterIcon } from "../components/Icons";
import DateTimePicker from "../components/DateTimePicker";
import { useResponsive } from "../hooks/useResponsive";
import moment from "moment";

export default function Outsource() {
  const { 
    partners, 
    addPartner, 
    updatePartner, 
    deletePartner,
    bookings,
    addBooking,
    expenses,
    income
  } = useAppStore();

  const { isMobile } = useResponsive();

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
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

  const [bookingForm, setBookingForm] = useState({
    customer: "",
    partner: "",
    pickup: "",
    destination: "",
    datetime: "", // Combined date and time
    amount: "",
    notes: ""
  });

  // Get outsourced bookings
  const outsourcedBookings = bookings.filter(booking => booking.type === "outsourced");

  // Calculate partner stats
  const partnerStats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === "active").length,
    totalRevenue: partners.reduce((sum, p) => sum + (p.totalRevenue || 0), 0),
    avgRating: partners.length > 0 ? 
      partners.reduce((sum, p) => sum + p.rating, 0) / partners.length : 0
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

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    // Convert datetime back to separate date and time for compatibility
    let date = '';
    let time = '';
    if (bookingForm.datetime) {
      const momentDateTime = moment(bookingForm.datetime);
      date = momentDateTime.format('YYYY-MM-DD');
      time = momentDateTime.format('HH:mm');
    }
    
    const bookingData = {
      ...bookingForm,
      date,
      time,
      type: "outsourced",
      status: "confirmed"
    };
    
    // Remove the combined datetime field as it's not needed in the final data
    delete bookingData.datetime;
    
    const result = addBooking(bookingData);
    if (result.success) {
      setShowBookingModal(false);
      resetBookingForm();
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

  const resetBookingForm = () => {
    setBookingForm({
      customer: "",
      partner: "",
      pickup: "",
      destination: "",
      datetime: "",
      amount: "",
      notes: ""
    });
  };

  const handleEditPartner = (partner) => {
    setEditingPartner(partner);
    setPartnerForm(partner);
    setShowPartnerModal(true);
  };

  const handleDeletePartner = (id) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      deletePartner(id);
    }
  };

  const filteredPartners = partners.filter(partner => {
    if (filters.status !== 'all' && partner.status !== filters.status) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Outsource Partners</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBookingModal(true)}
            className="btn btn-outline flex items-center gap-2"
          >
            <BookingIcon className="w-4 h-4" />
            Outsource Booking
          </button>
          <button 
            onClick={() => setShowPartnerModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Partner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <BookingIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outsourcedBookings.length}</p>
              <p className="text-sm text-gray-600">Outsourced Bookings</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-emerald-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <span className="text-lg font-bold">€</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{partnerStats.totalRevenue.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <FilterIcon className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="form-select text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Partner Companies</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Commission</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.id}>
                  <td className="font-medium">{partner.name}</td>
                  <td>{partner.contact}</td>
                  <td>{partner.phone}</td>
                  <td>{partner.email}</td>
                  <td>
                    <span className={`badge ${
                      partner.status === 'active' ? 'badge-green' : 'badge-red'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{partner.rating}</span>
                    </div>
                  </td>
                  <td>{partner.commissionRate}%</td>
                  <td>€{(partner.totalRevenue || 0).toFixed(0)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditPartner(partner)}
                        className="btn btn-outline px-2 py-1 text-xs"
                      >
                        <EditIcon className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeletePartner(partner.id)}
                        className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
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

      {/* Outsourced Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Outsourced Bookings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Partner</th>
                <th>Route</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outsourcedBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-medium">{booking.customer}</td>
                  <td>{booking.partner || 'Unassigned'}</td>
                  <td>
                    <div className="text-sm">
                      <div>{booking.pickup}</div>
                      <div className="text-gray-500">→ {booking.destination}</div>
                    </div>
                  </td>
                  <td>{booking.date}</td>
                  <td className="font-bold">€{booking.amount || 45}</td>
                  <td>
                    <span className={`badge ${
                      booking.status === 'completed' ? 'badge-green' :
                      booking.status === 'in-progress' ? 'badge-blue' :
                      'badge-yellow'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline px-2 py-1 text-xs">
                        View
                      </button>
                      <button className="btn btn-outline px-2 py-1 text-xs">
                        Track
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Modal */}
      {showPartnerModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </h3>
            <form onSubmit={handlePartnerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
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
                    Status
                  </label>
                  <select
                    value={partnerForm.status}
                    onChange={(e) => setPartnerForm({...partnerForm, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={partnerForm.commissionRate}
                    onChange={(e) => setPartnerForm({...partnerForm, commissionRate: Number(e.target.value)})}
                    className="form-input"
                    min="0"
                    max="100"
                  />
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
                    <option value="NET15">NET 15</option>
                    <option value="NET30">NET 30</option>
                    <option value="NET45">NET 45</option>
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

      {/* Outsource Booking Modal */}
      {showBookingModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="text-lg font-semibold mb-4">Outsource New Booking</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.customer}
                    onChange={(e) => setBookingForm({...bookingForm, customer: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner *
                  </label>
                  <select
                    value={bookingForm.partner}
                    onChange={(e) => setBookingForm({...bookingForm, partner: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select Partner</option>
                    {partners.filter(p => p.status === 'active').map(partner => (
                      <option key={partner.id} value={partner.name}>{partner.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.pickup}
                    onChange={(e) => setBookingForm({...bookingForm, pickup: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm({...bookingForm, destination: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <DateTimePicker
                    id="booking-datetime"
                    label="Date & Time"
                    value={bookingForm.datetime}
                    onChange={(datetime) => setBookingForm({...bookingForm, datetime})}
                    placeholder="Select pickup date and time..."
                    required
                    minDate={new Date().toISOString().split('T')[0]}
                    helpText="When to pick up the passenger"
                    isMobile={isMobile}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (€) *
                  </label>
                  <input
                    type="number"
                    value={bookingForm.amount}
                    onChange={(e) => setBookingForm({...bookingForm, amount: Number(e.target.value)})}
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    className="form-input"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  Create Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    resetBookingForm();
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