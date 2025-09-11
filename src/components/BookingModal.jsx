import { useState, useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import { useFleet } from '../context/FleetContext';
import ModalPortal from './ModalPortal';

export default function BookingModal({ 
  isOpen, 
  onClose, 
  editingBooking = null,
  initialDate = '',
  initialTime = '',
  title = null 
}) {
  const { addBooking, updateBooking, customers, drivers, partners } = useAppStore();
  const { fleet } = useFleet();

  const [formData, setFormData] = useState({
    customer: "",
    pickup: "",
    destination: "",
    date: initialDate,
    time: initialTime,
    driver: "",
    vehicle: "",
    partner: "",
    status: "pending",
    type: "single", // "single" or "tour"
    source: "internal", // "internal" or "outsourced"
    price: 45,
    tourStartDate: "",
    tourEndDate: "",
    hasReturn: false,
    returnPickup: "",
    returnDate: "",
    returnTime: ""
  });

  // Initialize form data when editing or when modal opens
  useEffect(() => {
    if (editingBooking) {
      // Handle backwards compatibility when loading existing bookings
      let type, source;
      if (editingBooking.type === 'outsourced') {
        // If the old type was 'outsourced', default to single trip + outsourced
        type = editingBooking.source === 'tour' ? 'tour' : 'single'; // Check if we have new source info
        source = 'outsourced';
      } else {
        type = editingBooking.type === 'tour' ? 'tour' : 'single';
        source = editingBooking.source || 'internal'; // Default to internal if not specified
      }
      
      setFormData({ 
        ...editingBooking,
        type,
        source
      });
    } else {
      setFormData({
        customer: "",
        pickup: "",
        destination: "",
        date: initialDate,
        time: initialTime,
        driver: "",
        vehicle: "",
        partner: "",
        status: "pending",
        type: "single",
        source: "internal",
        price: 45,
        tourStartDate: "",
        tourEndDate: "",
        hasReturn: false,
        returnPickup: "",
        returnDate: "",
        returnTime: ""
      });
    }
  }, [editingBooking, initialDate, initialTime, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create submission data with legacy compatibility
    const submissionData = {
      ...formData,
      // For backwards compatibility, map to the old single type field
      // Keep the new fields for future use
      type: formData.source === 'outsourced' ? 'outsourced' : formData.type
    };
    
    if (editingBooking) {
      updateBooking(editingBooking.id, submissionData);
    } else {
      addBooking(submissionData);
    }
    onClose();
  };

  const handleClose = () => {
    setFormData({
      customer: "",
      pickup: "",
      destination: "",
      date: "",
      time: "",
      driver: "",
      vehicle: "",
      partner: "",
      status: "pending",
      type: "single",
      source: "internal",
      price: 45,
      tourStartDate: "",
      tourEndDate: "",
      hasReturn: false,
      returnPickup: "",
      returnDate: "",
      returnTime: ""
    });
    onClose();
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="modal-container">
          {/* Sticky Header */}
          <div className="modal-header">
            <h2 className="text-xl font-bold">
              {title || (editingBooking ? "Edit Booking" : "New Booking")}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="btn-close"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Booking Type - Radio buttons with enhanced styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Trip Type */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-800 mb-3">Trip Type</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="tripType"
                          value="single"
                          checked={formData.type === 'single'}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Single Trip</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="tripType"
                          value="tour"
                          checked={formData.type === 'tour'}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Tour</span>
                    </label>
                  </div>
                </div>

                {/* Service Source */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-800 mb-3">Service Source</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="serviceSource"
                          value="internal"
                          checked={formData.source === 'internal'}
                          onChange={(e) => setFormData({...formData, source: e.target.value})}
                          className="w-5 h-5 text-emerald-600 bg-white border-2 border-gray-300 focus:ring-emerald-500 focus:ring-2"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">Internal</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="serviceSource"
                          value="outsourced"
                          checked={formData.source === 'outsourced'}
                          onChange={(e) => setFormData({...formData, source: e.target.value})}
                          className="w-5 h-5 text-orange-600 bg-white border-2 border-gray-300 focus:ring-orange-500 focus:ring-2"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">Outsourced</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tour Date Fields - Show for tour bookings */}
              {formData.type === 'tour' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl border-2 border-blue-200/50 shadow-inner">
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-800">Tour Start Date</label>
                    <input
                      type="date"
                      value={formData.tourStartDate}
                      onChange={(e) => setFormData({...formData, tourStartDate: e.target.value})}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                      required={formData.type === 'tour'}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-800">Tour End Date</label>
                    <input
                      type="date"
                      value={formData.tourEndDate}
                      onChange={(e) => setFormData({...formData, tourEndDate: e.target.value})}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                      required={formData.type === 'tour'}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-800">Customer</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter customer name..."
                    required
                  />
                </div>
                {/* Driver field - Show for Internal bookings only */}
                {formData.source === 'internal' && (
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-800">Driver</label>
                    <select
                      value={formData.driver}
                      onChange={(e) => setFormData({...formData, driver: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                      required={formData.source === 'internal'}
                    >
                      <option value="">Select Driver</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.name}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Partner field - Show for Outsourced bookings only */}
                {formData.source === 'outsourced' && (
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-800">Partner/External Provider</label>
                    <input
                      type="text"
                      value={formData.partner || ''}
                      onChange={(e) => setFormData({...formData, partner: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                      placeholder="Enter partner company name..."
                      required={formData.source === 'outsourced'}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-800">Pickup Location</label>
                  <input
                    type="text"
                    value={formData.pickup}
                    onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter pickup location..."
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-800">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter destination..."
                    required
                  />
                </div>
              </div>

              {/* Pickup Date and Time - Hide for Tours */}
              {formData.type === 'single' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-800">Pickup Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                      required={formData.type === 'single'}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-800">Pickup Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                      required={formData.type === 'single'}
                    />
                  </div>
                </div>
              )}

              {/* Vehicle field - Show for Internal bookings only */}
              {formData.source === 'internal' && (
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-800">Vehicle</label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    required={formData.source === 'internal'}
                  >
                    <option value="">Select Vehicle</option>
                    {fleet.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.name}>{vehicle.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Return Trip Fields */}
              <div className="space-y-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.hasReturn}
                      onChange={(e) => setFormData({...formData, hasReturn: e.target.checked})}
                      className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">This booking has a return trip</span>
                </label>

                {formData.hasReturn && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 rounded-xl border-2 border-emerald-200/50 shadow-inner">
                    <div className="sm:col-span-2">
                      <label className="block mb-2 text-sm font-bold text-gray-800">Return Pickup Location</label>
                      <input
                        type="text"
                        value={formData.returnPickup}
                        onChange={(e) => setFormData({...formData, returnPickup: e.target.value})}
                        className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                        placeholder="Usually the original destination..."
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-bold text-gray-800">Return Date</label>
                      <input
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                        className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-bold text-gray-800">Return Time</label>
                      <input
                        type="time"
                        value={formData.returnTime}
                        onChange={(e) => setFormData({...formData, returnTime: e.target.value})}
                        className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Price (€)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">€</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                      placeholder="45.00"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline btn-action"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-action"
            >
              {editingBooking ? "Update" : "Create"} Booking
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}