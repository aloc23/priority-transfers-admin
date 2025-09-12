import { useState, useEffect } from 'react';
import moment from 'moment';
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
  const { addBooking, updateBooking, customers, drivers, partners, bookings } = useAppStore();
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
    tourPickupTime: "",
    tourReturnPickupTime: "",
    hasReturn: false,
    returnPickup: "",
    returnDestination: "",
    returnDate: "",
    returnTime: ""
  });

  const [conflicts, setConflicts] = useState({
    driver: [],
    vehicle: []
  });

  // Conflict detection function
  const checkForConflicts = (currentFormData) => {
    const newConflicts = { driver: [], vehicle: [] };
    
    if (currentFormData.source !== 'internal') {
      setConflicts(newConflicts);
      return newConflicts;
    }

    // Get time ranges for the current booking
    const getBookingTimeRanges = (booking) => {
      const ranges = [];
      
      if (booking.type === 'tour') {
        if (booking.tourStartDate && booking.tourEndDate) {
          ranges.push({
            startDate: booking.tourStartDate,
            endDate: booking.tourEndDate,
            startTime: booking.tourPickupTime || '09:00',
            endTime: booking.tourReturnPickupTime || '17:00'
          });
        }
      } else {
        if (booking.date) {
          const startTime = booking.time || '09:00';
          const endTime = moment(startTime, 'HH:mm').add(2, 'hours').format('HH:mm');
          ranges.push({
            startDate: booking.date,
            endDate: booking.date,
            startTime,
            endTime
          });
        }
        
        if (booking.hasReturn && booking.returnDate) {
          const startTime = booking.returnTime || '09:00';
          const endTime = moment(startTime, 'HH:mm').add(2, 'hours').format('HH:mm');
          ranges.push({
            startDate: booking.returnDate,
            endDate: booking.returnDate,
            startTime,
            endTime
          });
        }
      }
      
      return ranges;
    };

    // Check if two time ranges overlap
    const rangesOverlap = (range1, range2) => {
      const start1 = moment(`${range1.startDate} ${range1.startTime}`);
      const end1 = moment(`${range1.endDate} ${range1.endTime}`);
      const start2 = moment(`${range2.startDate} ${range2.startTime}`);
      const end2 = moment(`${range2.endDate} ${range2.endTime}`);
      
      return start1.isBefore(end2) && start2.isBefore(end1);
    };

    const currentRanges = getBookingTimeRanges(currentFormData);
    
    // Check all existing bookings for conflicts
    bookings.forEach(booking => {
      // Skip the booking we're editing
      if (editingBooking && booking.id === editingBooking.id) return;
      
      // Skip cancelled bookings
      if (booking.status === 'cancelled') return;
      
      // Skip bookings that don't have drivers or vehicles assigned
      if (booking.source !== 'internal') return;
      
      const existingRanges = getBookingTimeRanges(booking);
      
      // Check for overlaps between current booking and existing booking
      currentRanges.forEach(currentRange => {
        existingRanges.forEach(existingRange => {
          if (rangesOverlap(currentRange, existingRange)) {
            // Driver conflict
            if (currentFormData.driver && booking.driver === currentFormData.driver) {
              newConflicts.driver.push({
                booking,
                conflictDate: existingRange.startDate,
                conflictTime: existingRange.startTime
              });
            }
            
            // Vehicle conflict
            if (currentFormData.vehicle && booking.vehicle === currentFormData.vehicle) {
              newConflicts.vehicle.push({
                booking,
                conflictDate: existingRange.startDate,
                conflictTime: existingRange.startTime
              });
            }
          }
        });
      });
    });
    
    setConflicts(newConflicts);
    return newConflicts;
  };

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
        tourPickupTime: "",
        tourReturnPickupTime: "",
        hasReturn: false,
        returnPickup: "",
        returnDestination: "",
        returnDate: "",
        returnTime: ""
      });
    }
  }, [editingBooking, initialDate, initialTime, isOpen]);

  // Auto-fill return pickup with destination when return trip is enabled
  useEffect(() => {
    if (formData.hasReturn && formData.destination && !formData.returnPickup) {
      setFormData(prev => ({
        ...prev,
        returnPickup: prev.destination
      }));
    }
  }, [formData.hasReturn, formData.destination]);

  // Check for conflicts when relevant form data changes
  useEffect(() => {
    if (isOpen) {
      checkForConflicts(formData);
    }
  }, [formData.driver, formData.vehicle, formData.date, formData.time, formData.returnDate, formData.returnTime, formData.tourStartDate, formData.tourEndDate, formData.tourPickupTime, formData.tourReturnPickupTime, formData.type, formData.source, formData.hasReturn, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for conflicts before submitting
    const currentConflicts = checkForConflicts(formData);
    const hasConflicts = currentConflicts.driver.length > 0 || currentConflicts.vehicle.length > 0;
    
    if (hasConflicts && !window.confirm('There are conflicting assignments. Do you want to proceed anyway?')) {
      return;
    }
    
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
      tourPickupTime: "",
      tourReturnPickupTime: "",
      hasReturn: false,
      returnPickup: "",
      returnDate: "",
      returnTime: ""
    });
    onClose();
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        aria-describedby="booking-modal-description"
      >
        <div className="modal-container">
          {/* Sticky Header */}
          <div className="modal-header">
            <h2 id="booking-modal-title" className="text-xl font-bold">
              {title || (editingBooking ? "Edit Booking" : "Create New Booking")}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="btn-close"
              aria-label={`Close ${editingBooking ? 'edit' : 'new'} booking modal`}
            >
              ×
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="modal-body">
            <p id="booking-modal-description" className="sr-only">
              {editingBooking 
                ? "Edit the booking details using the form below. All fields marked with an asterisk are required."
                : "Create a new booking by filling out the form below. All fields marked with an asterisk are required."
              }
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* Booking Type - Radio buttons with enhanced styling and accessibility */}
              <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <legend className="sr-only">Booking Configuration</legend>
                
                {/* Trip Type */}
                <div className="space-y-4">
                  <legend className="block text-sm font-bold text-gray-800 mb-3">
                    Trip Type <span className="text-red-500" aria-label="required">*</span>
                  </legend>
                  <div 
                    className="flex flex-col gap-3" 
                    role="radiogroup" 
                    aria-labelledby="trip-type-legend"
                    aria-required="true"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer group hover:bg-blue-50 p-3 rounded-lg transition-all duration-200">
                      <div className="relative">
                        <input
                          type="radio"
                          name="tripType"
                          value="single"
                          checked={formData.type === 'single'}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
                          aria-describedby="trip-type-single-desc"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Transfer</span>
                        <p id="trip-type-single-desc" className="text-xs text-gray-500 mt-1">Single journey from pickup to destination</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group hover:bg-green-50 p-3 rounded-lg transition-all duration-200">
                      <div className="relative">
                        <input
                          type="radio"
                          name="tripType"
                          value="tour"
                          checked={formData.type === 'tour'}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-5 h-5 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2 focus:ring-offset-2"
                          aria-describedby="trip-type-tour-desc"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">Tour</span>
                        <p id="trip-type-tour-desc" className="text-xs text-gray-500 mt-1">Multi-day service with date range</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Service Source */}
                <div className="space-y-4">
                  <legend className="block text-sm font-bold text-gray-800 mb-3">
                    Service Source <span className="text-red-500" aria-label="required">*</span>
                  </legend>
                  <div 
                    className="flex flex-col gap-3" 
                    role="radiogroup" 
                    aria-labelledby="service-source-legend"
                    aria-required="true"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer group hover:bg-emerald-50 p-3 rounded-lg transition-all duration-200">
                      <div className="relative">
                        <input
                          type="radio"
                          name="serviceSource"
                          value="internal"
                          checked={formData.source === 'internal'}
                          onChange={(e) => setFormData({...formData, source: e.target.value})}
                          className="w-5 h-5 text-emerald-600 bg-white border-2 border-gray-300 focus:ring-emerald-500 focus:ring-2 focus:ring-offset-2"
                          aria-describedby="service-internal-desc"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">Internal</span>
                        <p id="service-internal-desc" className="text-xs text-gray-500 mt-1">Use our fleet and drivers</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group hover:bg-orange-50 p-3 rounded-lg transition-all duration-200">
                      <div className="relative">
                        <input
                          type="radio"
                          name="serviceSource"
                          value="outsourced"
                          checked={formData.source === 'outsourced'}
                          onChange={(e) => setFormData({...formData, source: e.target.value})}
                          className="w-5 h-5 text-orange-600 bg-white border-2 border-gray-300 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2"
                          aria-describedby="service-outsourced-desc"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">Outsourced</span>
                        <p id="service-outsourced-desc" className="text-xs text-gray-500 mt-1">Use external partner services</p>
                      </div>
                    </label>
                  </div>
                </div>
              </fieldset>
              {/* Tour Date Fields - Show for tour bookings with enhanced UX */}
              {formData.type === 'tour' && (
                <fieldset className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl border-2 border-blue-200/50 shadow-inner">
                  <legend className="text-lg font-bold text-blue-900 mb-4">
                    Tour Details
                  </legend>
                  <p className="text-sm text-blue-700 mb-6 bg-blue-100/50 p-3 rounded-lg">
                    <strong>Tour bookings span multiple days.</strong> Specify the start and end dates along with pickup and return times.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tour-start-date" className="block mb-2 text-sm font-bold text-gray-800">
                        Tour Start Date <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <input
                        id="tour-start-date"
                        type="date"
                        value={formData.tourStartDate}
                        onChange={(e) => setFormData({...formData, tourStartDate: e.target.value})}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                        required={formData.type === 'tour'}
                        aria-describedby="tour-start-date-help"
                      />
                      <p id="tour-start-date-help" className="mt-1 text-xs text-gray-600">When the tour begins</p>
                    </div>
                    <div>
                      <label htmlFor="tour-end-date" className="block mb-2 text-sm font-bold text-gray-800">
                        Tour End Date <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <input
                        id="tour-end-date"
                        type="date"
                        value={formData.tourEndDate}
                        onChange={(e) => setFormData({...formData, tourEndDate: e.target.value})}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                        required={formData.type === 'tour'}
                        aria-describedby="tour-end-date-help"
                        min={formData.tourStartDate || undefined}
                      />
                      <p id="tour-end-date-help" className="mt-1 text-xs text-gray-600">When the tour ends</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tour-pickup-time" className="block mb-2 text-sm font-bold text-gray-800">
                        Pick Up Time <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <input
                        id="tour-pickup-time"
                        type="time"
                        value={formData.tourPickupTime}
                        onChange={(e) => setFormData({...formData, tourPickupTime: e.target.value})}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                        required={formData.type === 'tour'}
                        aria-describedby="tour-pickup-time-help"
                      />
                      <p id="tour-pickup-time-help" className="mt-1 text-xs text-gray-600">Initial pickup time</p>
                    </div>
                    <div>
                      <label htmlFor="tour-return-time" className="block mb-2 text-sm font-bold text-gray-800">
                        Return Pick Up Time <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <input
                        id="tour-return-time"
                        type="time"
                        value={formData.tourReturnPickupTime}
                        onChange={(e) => setFormData({...formData, tourReturnPickupTime: e.target.value})}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                        required={formData.type === 'tour'}
                        aria-describedby="tour-return-time-help"
                      />
                      <p id="tour-return-time-help" className="mt-1 text-xs text-gray-600">Final return pickup time</p>
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Customer and Resource Assignment */}
              <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <legend className="sr-only">Customer and Resource Assignment</legend>
                
                <div>
                  <label htmlFor="customer-name" className="block mb-2 text-sm font-bold text-gray-800">
                    Customer <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400 hover:border-gray-400"
                    placeholder="Enter customer name..."
                    required
                    aria-describedby="customer-name-help"
                  />
                  <p id="customer-name-help" className="mt-1 text-xs text-gray-600">Full name of the customer or company</p>
                </div>
                
                {/* Driver field - Show for Internal bookings only */}
                {formData.source === 'internal' && (
                  <div>
                    <label htmlFor="driver-select" className="block mb-2 text-sm font-bold text-gray-800">
                      Driver <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <select
                      id="driver-select"
                      value={formData.driver}
                      onChange={(e) => setFormData({...formData, driver: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 ${conflicts.driver.length > 0 ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                      required={formData.source === 'internal'}
                      aria-describedby="driver-select-help driver-conflicts"
                      aria-invalid={conflicts.driver.length > 0 ? 'true' : 'false'}
                    >
                      <option value="">Select a driver...</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.name}>{driver.name}</option>
                      ))}
                    </select>
                    <p id="driver-select-help" className="mt-1 text-xs text-gray-600">
                      Assign a driver from your internal team
                    </p>
                    {conflicts.driver.length > 0 && (
                      <div id="driver-conflicts" className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                        <p className="text-sm font-bold text-red-800 mb-2">Driver Conflict Detected</p>
                        {conflicts.driver.map((conflict, index) => (
                          <p key={index} className="text-xs text-red-600">
                            {conflict.booking.customer} on {conflict.conflictDate} at {conflict.conflictTime}
                          </p>
                        ))}
                        <p className="text-xs text-red-600 mt-1 font-medium">This driver is already scheduled for another booking during this time.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Partner field - Show for Outsourced bookings only */}
                {formData.source === 'outsourced' && (
                  <div>
                    <label htmlFor="partner-select" className="block mb-2 text-sm font-bold text-gray-800">
                      Partner/External Provider <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <select
                      id="partner-select"
                      value={formData.partner || ''}
                      onChange={(e) => setFormData({...formData, partner: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                      required={formData.source === 'outsourced'}
                      aria-describedby="partner-select-help"
                    >
                      <option value="">Select a partner...</option>
                      {partners.filter(partner => partner.status === 'active').map(partner => (
                        <option key={partner.id} value={partner.name}>{partner.name}</option>
                      ))}
                    </select>
                    <p id="partner-select-help" className="mt-1 text-xs text-gray-600">
                      Select from your approved external service providers
                    </p>
                  </div>
                )}
              </fieldset>

              {/* Location Information */}
              <fieldset className="space-y-6">
                <legend className="text-lg font-semibold text-gray-900 mb-4">Location Details</legend>
                
                <div>
                  <label htmlFor="pickup-location" className="block mb-2 text-sm font-bold text-gray-800">
                    Pickup Location <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <input
                    id="pickup-location"
                    type="text"
                    value={formData.pickup}
                    onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400 hover:border-gray-400"
                    placeholder="Enter pickup address or location..."
                    required
                    aria-describedby="pickup-location-help"
                  />
                  <p id="pickup-location-help" className="mt-1 text-xs text-gray-600">Full address or landmark where passenger will be picked up</p>
                </div>

                <div>
                  <label htmlFor="destination-location" className="block mb-2 text-sm font-bold text-gray-800">
                    Destination <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <input
                    id="destination-location"
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400 hover:border-gray-400"
                    placeholder="Enter destination address or location..."
                    required
                    aria-describedby="destination-location-help"
                  />
                  <p id="destination-location-help" className="mt-1 text-xs text-gray-600">Full address or landmark for the final destination</p>
                </div>
              </fieldset>

              {/* Pickup Date and Time - Show for Transfer bookings only */}
              {formData.type === 'single' && (
                <fieldset className="space-y-6 p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 rounded-xl border-2 border-gray-200/50 shadow-inner">
                  <legend className="text-lg font-bold text-gray-900 mb-4">Transfer Schedule</legend>
                  <p className="text-sm text-gray-700 mb-6 bg-blue-100/50 p-3 rounded-lg">
                    <strong>Transfer bookings</strong> are single journeys on a specific date and time.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="pickup-date" className="block mb-2 text-sm font-bold text-gray-800">
                        Pickup Date <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <input
                        id="pickup-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        required={formData.type === 'single'}
                        aria-describedby="pickup-date-help"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p id="pickup-date-help" className="mt-1 text-xs text-gray-600">Date of the pickup</p>
                    </div>
                    <div>
                      <label htmlFor="pickup-time" className="block mb-2 text-sm font-bold text-gray-800">
                        Pickup Time <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <input
                        id="pickup-time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        required={formData.type === 'single'}
                        aria-describedby="pickup-time-help"
                      />
                      <p id="pickup-time-help" className="mt-1 text-xs text-gray-600">Time of the pickup</p>
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Vehicle field - Show for Internal bookings only */}
              {formData.source === 'internal' && (
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-800">Vehicle</label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 ${conflicts.vehicle.length > 0 ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    required={formData.source === 'internal'}
                  >
                    <option value="">Select Vehicle</option>
                    {fleet.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.name}>{vehicle.name}</option>
                    ))}
                  </select>
                  {conflicts.vehicle.length > 0 && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-bold text-red-800 mb-2">Vehicle Conflict Detected</p>
                      {conflicts.vehicle.map((conflict, index) => (
                        <p key={index} className="text-xs text-red-600">
                          {conflict.booking.customer} on {conflict.conflictDate} at {conflict.conflictTime}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Return Trip Fields - Only show for single/transfer trips */}
              {formData.type === 'single' && (
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
                      <div>
                        <label className="block mb-2 text-sm font-bold text-gray-800">Return Pickup Location</label>
                        <input
                          type="text"
                          value={formData.returnPickup}
                          onChange={(e) => setFormData({...formData, returnPickup: e.target.value})}
                          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                          placeholder="Where to pick up for return trip..."
                        />
                        <p className="mt-1 text-xs text-gray-600">Auto-filled with destination</p>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-gray-800">Return Destination</label>
                        <input
                          type="text"
                          value={formData.returnDestination}
                          onChange={(e) => setFormData({...formData, returnDestination: e.target.value})}
                          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                          placeholder="Final return destination..."
                        />
                        <p className="mt-1 text-xs text-gray-600">Where the return trip ends</p>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-gray-800">Return Date</label>
                        <input
                          type="date"
                          value={formData.returnDate}
                          onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                        />
                        <p className="mt-1 text-xs text-gray-600">Date of the return trip</p>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-gray-800">Return Pickup Time</label>
                        <input
                          type="time"
                          value={formData.returnTime}
                          onChange={(e) => setFormData({...formData, returnTime: e.target.value})}
                          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                        />
                        <p className="mt-1 text-xs text-gray-600">Time to pick up for return</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

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