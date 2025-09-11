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
    type: "single",
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
      setFormData({ ...editingBooking });
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
    if (editingBooking) {
      updateBooking(editingBooking.id, formData);
    } else {
      addBooking(formData);
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Booking Type - Radio buttons */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingType"
                      value="single"
                      checked={formData.type === 'single'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Single Trip</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingType"
                      value="tour"
                      checked={formData.type === 'tour'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Tour</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingType"
                      value="outsourced"
                      checked={formData.type === 'outsourced'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Outsourced</span>
                  </label>
                </div>
              </div>

              {/* Tour Date Fields - Show for tour bookings */}
              {formData.type === 'tour' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Tour Start Date</label>
                    <input
                      type="date"
                      value={formData.tourStartDate}
                      onChange={(e) => setFormData({...formData, tourStartDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={formData.type === 'tour'}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Tour End Date</label>
                    <input
                      type="date"
                      value={formData.tourEndDate}
                      onChange={(e) => setFormData({...formData, tourEndDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={formData.type === 'tour'}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Customer</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className="input-animated"
                    required
                  />
                </div>
                {/* Driver field - Show for single trip and tour, hide for outsourced */}
                {(formData.type === 'single' || formData.type === 'tour') && (
                  <div>
                    <label className="block mb-1">Driver</label>
                    <select
                      value={formData.driver}
                      onChange={(e) => setFormData({...formData, driver: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={formData.type === 'single' || formData.type === 'tour'}
                    >
                      <option value="">Select Driver</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.name}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Partner field - Show for outsourced */}
                {formData.type === 'outsourced' && (
                  <div>
                    <label className="block mb-1">Partner/External Provider</label>
                    <input
                      type="text"
                      value={formData.partner || ''}
                      onChange={(e) => setFormData({...formData, partner: e.target.value})}
                      className="input-animated"
                      placeholder="Enter partner company name"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={formData.pickup}
                  onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                  className="input-animated"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="input-animated"
                  required
                />
              </div>

              {/* Pickup Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Pickup Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Pickup Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Vehicle field - Show for single trip and tour, hide for outsourced */}
              {(formData.type === 'single' || formData.type === 'tour') && (
                <div>
                  <label className="block mb-1">Vehicle</label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={formData.type === 'single' || formData.type === 'tour'}
                  >
                    <option value="">Select Vehicle</option>
                    {fleet.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.name}>{vehicle.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Return Trip Fields */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasReturn}
                    onChange={(e) => setFormData({...formData, hasReturn: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">This booking has a return trip</span>
                </label>

                {formData.hasReturn && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="sm:col-span-2">
                      <label className="block mb-1 text-sm font-medium text-gray-700">Return Pickup Location</label>
                      <input
                        type="text"
                        value={formData.returnPickup}
                        onChange={(e) => setFormData({...formData, returnPickup: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Usually the original destination"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Return Date</label>
                      <input
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Return Time</label>
                      <input
                        type="time"
                        value={formData.returnTime}
                        onChange={(e) => setFormData({...formData, returnTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter price..."
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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