import { sendDriverEmailNotification } from '../utils/email';
import { useState, useEffect } from 'react';
import { calculateTotalPrice } from '../utils/priceCalculator';
import supabase from '../utils/supabaseClient';
// Add fetch for Google Maps Directions API
import moment from 'moment';
import { useAppStore } from '../context/AppStore';
import { useFleet } from '../context/FleetContext';
import ModalPortal from './ModalPortal';
import DateTimePicker from './DateTimePicker';
import supabase from '../utils/supabaseClient';

export default function BookingModal({ 
  // Demo: Send email notification to driver
  isOpen, 
  onClose, 
  editingBooking = null,
  initialDate = '',
  initialTime = '',
  title = null 
}) {
  const { addBooking, updateBooking, customers, drivers, partners, bookings } = useAppStore();
  const { fleet } = useFleet();

  // State for journey info
  const [journeyInfo, setJourneyInfo] = useState({ distance: '', duration: '', error: '' });
  // Track if price was manually overridden
  const [priceManuallySet, setPriceManuallySet] = useState(false);

  // Demo: Send email notification to driver
  async function handleSendDriverEmail() {
    if (!formData.driver) {
      alert('Please select a driver first.');
      return;
    }
    const driverObj = drivers.find(d => d.name === formData.driver);
    if (!driverObj || !driverObj.email) {
      alert('Selected driver has no email address.');
      return;
    }
    const subject = `Booking Reminder: ${formData.pickup} → ${formData.destination}`;
    const message = `Dear ${driverObj.name},\n\nYou have a new booking:\nPickup: ${formData.pickup}\nDestination: ${formData.destination}\nDate: ${formData.date} ${formData.time}\n\nPlease confirm availability.`;
    await sendDriverEmailNotification({ driverEmail: driverObj.email, subject, message });
    window.alert(`Demo email notification sent to ${driverObj.email}`);
  }

  // Force price recalculation using latest journey info and vehicle
  function forceRecalculatePrice() {
    let runningCost = 0, fuelRate = 0;
    let runningCostUnit = 'km', fuelRateUnit = 'km';
    if (formData.vehicle) {
      const selectedVehicle = fleet.find(v => v.name === formData.vehicle);
      if (selectedVehicle) {
        runningCost = parseFloat(selectedVehicle.runningCost) || 0;
        fuelRate = parseFloat(selectedVehicle.fuelRate) || 0;
        if (selectedVehicle.runningCostUnit) runningCostUnit = selectedVehicle.runningCostUnit;
        if (selectedVehicle.fuelRateUnit) fuelRateUnit = selectedVehicle.fuelRateUnit;
      }
    }
    // Convert per-mile rates to per-km if needed
    const MILE_TO_KM = 1.60934;
    if (runningCostUnit === 'mile') runningCost = runningCost / MILE_TO_KM;
    if (fuelRateUnit === 'mile') fuelRate = fuelRate / MILE_TO_KM;
    // Parse distance from journeyInfo
    let distanceKm = 0;
    if (journeyInfo.distance) {
      const match = journeyInfo.distance.match(/([\d.]+)\s*km/);
      if (match) distanceKm = parseFloat(match[1]);
    }
    const price = (runningCost + fuelRate) * distanceKm;
    setFormData(prev => ({ ...prev, price: Math.round(price * 100) / 100 }));
    setPriceManuallySet(false);
  }

  // Google Maps JavaScript API DirectionsService fetch function
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

  function fetchJourneyInfo(pickup, destination, hasReturn = false) {
    if (!pickup || !destination) return;
    const apiKey = 'AIzaSyDoCk3Y84BUdtuOQNNjSm7rPOOZzenrkkw'; // <-- Your API key
    loadGoogleMapsScript(apiKey, () => {
      if (!(window.google && window.google.maps && window.google.maps.DirectionsService)) {
        setJourneyInfo({ distance: '', duration: '', error: 'Google Maps failed to load.' });
        return;
      }
      const directionsService = new window.google.maps.DirectionsService();
      // If tour, use stops as waypoints
      const waypoints = (formData.type === 'tour' && Array.isArray(formData.stops))
        ? formData.stops.filter(s => s).map(stop => ({ location: stop, stopover: true }))
        : [];
      directionsService.route(
        {
          origin: pickup,
          destination: destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result.routes.length > 0) {
            // Sum all legs for total tour distance/duration
            let distanceMeters = 0, durationSeconds = 0;
            result.routes[0].legs.forEach(leg => {
              distanceMeters += leg.distance.value;
              durationSeconds += leg.duration.value;
            });
            let distanceKm = distanceMeters / 1000;
            let durationMin = durationSeconds / 60;
            if (hasReturn) {
              distanceKm *= 2;
              durationMin *= 2;
            }
            setJourneyInfo({
              distance: `${distanceKm.toFixed(2)} km`,
              duration: `${durationMin.toFixed(1)} min`,
              error: ''
            });
            // Auto-calculate price if not manually set
            if (!priceManuallySet) {
              let runningCost = 0, fuelRate = 0;
              let runningCostUnit = 'km', fuelRateUnit = 'km';
              if (formData.vehicle) {
                const selectedVehicle = fleet.find(v => v.name === formData.vehicle);
                if (selectedVehicle) {
                  runningCost = parseFloat(selectedVehicle.runningCost) || 0;
                  fuelRate = parseFloat(selectedVehicle.fuelRate) || 0;
                  if (selectedVehicle.runningCostUnit) runningCostUnit = selectedVehicle.runningCostUnit;
                  if (selectedVehicle.fuelRateUnit) fuelRateUnit = selectedVehicle.fuelRateUnit;
                }
              }
              // Convert per-mile rates to per-km if needed
              const MILE_TO_KM = 1.60934;
              if (runningCostUnit === 'mile') runningCost = runningCost / MILE_TO_KM;
              if (fuelRateUnit === 'mile') fuelRate = fuelRate / MILE_TO_KM;
              // Calculate price: (fuel + running) * distance
              const price = (runningCost + fuelRate) * distanceKm;
              setFormData(prev => ({ ...prev, price: Math.round(price * 100) / 100 }));
            }
          } else {
            setJourneyInfo({ distance: '', duration: '', error: 'No route found.' });
          }
        }
      );
    });
  }

  const [formData, setFormData] = useState({
    customer: "",
    pickup: "",
    destination: "",
    stops: [], // Array of stops for tours
    date: initialDate,
    time: initialTime,
    pickupDateTime: "", // Combined date/time for pickup
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
    returnTime: "",
    returnDateTime: "" // Combined date/time for return
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
      
      // Initialize combined datetime fields from existing date/time fields
      let pickupDateTime = '';
      if (editingBooking.date && editingBooking.time) {
        pickupDateTime = moment(`${editingBooking.date} ${editingBooking.time}`, 'YYYY-MM-DD HH:mm').toISOString();
      }
      
      let returnDateTime = '';
      if (editingBooking.returnDate && editingBooking.returnTime) {
        returnDateTime = moment(`${editingBooking.returnDate} ${editingBooking.returnTime}`, 'YYYY-MM-DD HH:mm').toISOString();
      }
      
      setFormData({ 
        ...editingBooking,
        type,
        source,
        pickupDateTime,
        returnDateTime
      });
    } else {
      // Initialize with current date/time if provided
      let pickupDateTime = '';
      if (initialDate && initialTime) {
        pickupDateTime = moment(`${initialDate} ${initialTime}`, 'YYYY-MM-DD HH:mm').toISOString();
      }
      
      setFormData({
        customer: "",
        pickup: "",
        destination: "",
        date: initialDate,
        time: initialTime,
        pickupDateTime,
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
        returnTime: "",
        returnDateTime: ""
      });
    }
  }, [editingBooking, initialDate, initialTime, isOpen]);

  // Auto-fill return trip data when return trip is enabled
  useEffect(() => {
    if (formData.hasReturn) {
      const updates = {};
      
      // Auto-fill return pickup with destination
      if (formData.destination && !formData.returnPickup) {
        updates.returnPickup = formData.destination;
      }
      
      // Auto-fill return destination with original pickup
      if (formData.pickup && !formData.returnDestination) {
        updates.returnDestination = formData.pickup;
      }
      
      // Auto-fill return date/time based on pickup date/time (add 4 hours by default)
      if (formData.pickupDateTime && !formData.returnDateTime) {
        const returnMoment = moment(formData.pickupDateTime).add(4, 'hours');
        updates.returnDateTime = returnMoment.toISOString();
        updates.returnDate = returnMoment.format('YYYY-MM-DD');
        updates.returnTime = returnMoment.format('HH:mm');
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...updates
        }));
      }
    }
  }, [formData.hasReturn, formData.destination, formData.pickup, formData.pickupDateTime]);

  // Check for conflicts when relevant form data changes
  useEffect(() => {
    if (isOpen) {
      checkForConflicts(formData);
    }
  }, [formData.driver, formData.vehicle, formData.date, formData.time, formData.returnDate, formData.returnTime, formData.tourStartDate, formData.tourEndDate, formData.tourPickupTime, formData.tourReturnPickupTime, formData.type, formData.source, formData.hasReturn, isOpen]);

  // Fetch journey info and auto-calculate price when pickup, destination, or return changes
  useEffect(() => {
    if (formData.pickup && formData.destination) {
      fetchJourneyInfo(formData.pickup, formData.destination, formData.hasReturn);
    } else {
      setJourneyInfo({ distance: '', duration: '', error: '' });
    }
    // eslint-disable-next-line
  }, [formData.pickup, formData.destination, formData.hasReturn, formData.stops]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for conflicts before submitting
    const currentConflicts = checkForConflicts(formData);
    const hasConflicts = currentConflicts.driver.length > 0 || currentConflicts.vehicle.length > 0;
    
    if (hasConflicts && !window.confirm('There are conflicting assignments. Do you want to proceed anyway?')) {
      return;
    }
    
    // Extract date/time from datetime fields for backwards compatibility
    const submissionData = { ...formData };

    // Always save journey distance and duration
    if (journeyInfo.distance) {
      submissionData.journeyDistance = journeyInfo.distance;
    }
    if (journeyInfo.duration) {
      submissionData.journeyDuration = journeyInfo.duration;
    }

    // Handle pickup datetime
    if (formData.pickupDateTime) {
      const pickupMoment = moment(formData.pickupDateTime);
      submissionData.date = pickupMoment.format('YYYY-MM-DD');
      submissionData.time = pickupMoment.format('HH:mm');
    }

    // Handle return datetime
    if (formData.returnDateTime) {
      const returnMoment = moment(formData.returnDateTime);
      submissionData.returnDate = returnMoment.format('YYYY-MM-DD');
      submissionData.returnTime = returnMoment.format('HH:mm');
    }

    // For backwards compatibility, map to the old single type field
    // Keep the new fields for future use
    submissionData.type = formData.source === 'outsourced' ? 'outsourced' : formData.type;

    // Save booking
    if (editingBooking) {
      updateBooking(editingBooking.id, submissionData);
    } else {
      addBooking(submissionData);
    }

    // After booking is confirmed, send driver notification (demo integration)
    if (formData.source === 'internal' && formData.driver) {
      const driverObj = drivers.find(d => d.name === formData.driver);
      if (driverObj && driverObj.email) {
        const subject = `Booking Reminder: ${formData.pickup} → ${formData.destination}`;
        const html = `<p>Dear ${driverObj.name},<br>You have a new booking:<br>Pickup: ${formData.pickup}<br>Destination: ${formData.destination}<br>Date: ${formData.date} ${formData.time}<br><br>Please confirm availability.</p>`;
        (async () => {
          // Get the latest session and JWT from Supabase Auth
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          console.log('Supabase sessionData:', sessionData);
          if (sessionError) {
            alert('Error retrieving Supabase session: ' + sessionError.message);
            console.error('Supabase session error:', sessionError);
            return;
          }
          const supabaseJwt = sessionData?.session?.access_token;
          console.log('Supabase JWT before fetch:', supabaseJwt);
          if (!supabaseJwt || typeof supabaseJwt !== 'string' || supabaseJwt.length < 20) {
            alert('No valid JWT found. Please log out and log in again with a Supabase account.');
            console.error('No valid Supabase JWT found. Session:', sessionData);
            return;
          }
          fetch('https://hepfwlezvvfdbkoqujhh.supabase.co/functions/v1/sendDriverConfirmation-ts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseJwt}`
            },
            body: JSON.stringify({ to: driverObj.email, subject, html })
          })
          .then(async res => {
            if (res.status === 401) {
              alert('401 Unauthorized: Your login token is missing or invalid. Please log out and log in again with a Supabase account.');
              console.error('401 Unauthorized: JWT missing or invalid.');
              return;
            }
            const data = await res.json();
            if (data.error) {
              console.error('Error from Edge Function:', data.error);
              alert('Error sending confirmation email: ' + data.error);
            } else {
              console.log('Driver confirmation email sent:', data);
              alert('Driver confirmation email sent successfully!');
            }
          })
          .catch(err => {
            console.error('Fetch error:', err);
            alert('Network error sending confirmation email: ' + err.message);
          });
        })();
      }
    }

    onClose();
  };

  const handleClose = () => {
    setFormData({
      customer: "",
      pickup: "",
      destination: "",
      stops: [], // Always reset stops to empty array
      date: "",
      time: "",
      pickupDateTime: "",
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
      returnTime: "",
      returnDateTime: ""
    });
    onClose();
  };

  // Handler for pickup datetime changes
  const handlePickupDateTimeChange = (datetime) => {
    if (datetime) {
      const momentValue = moment(datetime);
      setFormData(prev => ({
        ...prev,
        pickupDateTime: datetime,
        date: momentValue.format('YYYY-MM-DD'),
        time: momentValue.format('HH:mm')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        pickupDateTime: '',
        date: '',
        time: ''
      }));
    }
  };

  // Handler for return datetime changes
  const handleReturnDateTimeChange = (datetime) => {
    if (datetime) {
      const momentValue = moment(datetime);
      setFormData(prev => ({
        ...prev,
        returnDateTime: datetime,
        returnDate: momentValue.format('YYYY-MM-DD'),
        returnTime: momentValue.format('HH:mm')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        returnDateTime: '',
        returnDate: '',
        returnTime: ''
      }));
    }
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

              {/* Customer Information */}
              <fieldset className="space-y-6">
                <legend className="text-lg font-semibold text-gray-900 mb-4">Customer Information</legend>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                </div>
              </fieldset>

              {/* Trip Details Section */}
              <fieldset className="space-y-8 p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 rounded-xl border-2 border-gray-200/50 shadow-inner">
                <legend className="text-lg font-semibold text-gray-900 mb-4">Trip Details</legend>
                
                {/* Pickup Information Group */}
                <div className="space-y-6 p-4 bg-white/60 rounded-lg border border-blue-200/30">
                  <h4 className="text-md font-semibold text-blue-900 border-b border-blue-200 pb-2">Pickup Information</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                    {/* Pickup Date/Time - Show for Transfer bookings only */}
                    {formData.type === 'single' && (
                      <DateTimePicker
                        id="pickup-datetime"
                        label="Pickup Date & Time"
                        value={formData.pickupDateTime}
                        onChange={handlePickupDateTimeChange}
                        placeholder="Select pickup date and time..."
                        required
                        minDate={new Date().toISOString().split('T')[0]}
                        helpText="When to pick up the passenger"
                        aria-describedby="pickup-datetime-help"
                      />
                    )}
                  </div>
                </div>

                {/* Destination Information */}
                <div className="space-y-6 p-4 bg-white/60 rounded-lg border border-green-200/30">
                  <h4 className="text-md font-semibold text-green-900 border-b border-green-200 pb-2">Destination & Stops</h4>
                  <div>
                    <label htmlFor="destination-location" className="block mb-2 text-sm font-bold text-gray-800">
                      Destination <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <input
                      id="destination-location"
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter destination address or location..."
                      required
                      aria-describedby="destination-location-help"
                    />
                    <p id="destination-location-help" className="mt-1 text-xs text-gray-600">Full address or landmark for the final destination</p>
                  </div>
                  {/* Stops for tours */}
                  {formData.type === 'tour' && (
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-bold text-gray-800">Tour Stops (optional)</label>
                  {(formData.stops && formData.stops.length > 0) ? (
                    formData.stops.map((stop, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={stop}
                          onChange={e => {
                            const newStops = [...formData.stops];
                            newStops[idx] = e.target.value;
                            setFormData({ ...formData, stops: newStops });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder={`Stop ${idx + 1} address...`}
                        />
                        <button
                          type="button"
                          className="px-2 py-1 bg-red-100 text-red-700 rounded border border-red-300 text-xs font-semibold"
                          onClick={() => {
                            const newStops = formData.stops.filter((_, i) => i !== idx);
                            setFormData({ ...formData, stops: newStops });
                          }}
                        >Remove</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 mb-2">No stops added yet.</p>
                  )}
                  <button
                    type="button"
                    className="mt-2 px-3 py-2 bg-green-100 text-green-700 rounded border border-green-300 text-xs font-semibold"
                    onClick={() => setFormData({ ...formData, stops: [...(formData.stops || []), ""] })}
                  >Add Stop</button>
                    </div>
                  )}
                  {/* Journey Info (Distance & Duration) */}
                  {(journeyInfo.distance || journeyInfo.duration || journeyInfo.error) && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex flex-col gap-1">
                      <span className="font-semibold text-blue-800">Journey Info:</span>
                      {journeyInfo.error ? (
                        <span className="text-red-500">{journeyInfo.error}</span>
                      ) : (
                        <>
                          {journeyInfo.distance && <span>Distance: <b>{journeyInfo.distance}</b></span>}
                          {journeyInfo.duration && <span>Estimated Duration: <b>{journeyInfo.duration}</b></span>}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Return Transfer Toggle and Fields - Only show for single/transfer trips */}
                {formData.type === 'single' && (
                  <div className="space-y-6">
                    <label className="flex items-center space-x-3 cursor-pointer group p-4 bg-white/60 rounded-lg border border-purple-200/30 hover:bg-purple-50/30 transition-all duration-200">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.hasReturn}
                          onChange={(e) => setFormData({...formData, hasReturn: e.target.checked})}
                          className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">This booking has a return trip</span>
                    </label>

                    {formData.hasReturn && (
                      <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl border-2 border-purple-200/50 shadow-inner">
                        <h4 className="text-lg font-semibold text-purple-900 border-b border-purple-200 pb-2">Return Trip Details</h4>
                        <p className="text-sm text-purple-700 mb-4 bg-purple-100/50 p-3 rounded-lg">
                          <strong>Return trip information.</strong> These fields are auto-filled based on your pickup details, but you can customize them.
                        </p>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="return-pickup" className="block mb-2 text-sm font-bold text-gray-800">Return Pickup Location</label>
                            <input
                              id="return-pickup"
                              type="text"
                              value={formData.returnPickup}
                              onChange={(e) => setFormData({...formData, returnPickup: e.target.value})}
                              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                              placeholder="Where to pick up for return trip..."
                              aria-describedby="return-pickup-help"
                            />
                            <p id="return-pickup-help" className="mt-1 text-xs text-gray-600">Auto-filled with destination</p>
                          </div>

                          <DateTimePicker
                            id="return-datetime"
                            label="Return Pickup Date & Time"
                            value={formData.returnDateTime}
                            onChange={handleReturnDateTimeChange}
                            placeholder="Select return pickup date and time..."
                            minDate={formData.pickupDateTime ? moment(formData.pickupDateTime).format('YYYY-MM-DD') : new Date().toISOString().split('T')[0]}
                            helpText="When to pick up for the return trip"
                            aria-describedby="return-datetime-help"
                          />
                        </div>

                        <div>
                          <label htmlFor="return-destination" className="block mb-2 text-sm font-bold text-gray-800">Return Destination</label>
                          <input
                            id="return-destination"
                            type="text"
                            value={formData.returnDestination}
                            onChange={(e) => setFormData({...formData, returnDestination: e.target.value})}
                            className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                            placeholder="Final return destination..."
                            aria-describedby="return-destination-help"
                          />
                          <p id="return-destination-help" className="mt-1 text-xs text-gray-600">Where the return trip ends (auto-filled with original pickup)</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              {/* Vehicle Assignment - Show for Internal bookings only */}
              {formData.source === 'internal' && (
                <fieldset className="space-y-4">
                  <legend className="text-lg font-semibold text-gray-900">Vehicle Assignment</legend>
                  <div>
                    <label htmlFor="vehicle-select" className="block mb-2 text-sm font-bold text-gray-800">Vehicle</label>
                    <select
                      id="vehicle-select"
                      value={formData.vehicle}
                      onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 ${conflicts.vehicle.length > 0 ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                      required={formData.source === 'internal'}
                      aria-describedby="vehicle-select-help vehicle-conflicts"
                    >
                      <option value="">Select Vehicle</option>
                      {fleet.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.name}>{vehicle.name}</option>
                      ))}
                    </select>
                    <p id="vehicle-select-help" className="mt-1 text-xs text-gray-600">Choose a vehicle from your fleet</p>
                    {conflicts.vehicle.length > 0 && (
                      <div id="vehicle-conflicts" className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                        <p className="text-sm font-bold text-red-800 mb-2">Vehicle Conflict Detected</p>
                        {conflicts.vehicle.map((conflict, index) => (
                          <p key={index} className="text-xs text-red-600">
                            {conflict.booking.customer} on {conflict.conflictDate} at {conflict.conflictTime}
                          </p>
                        ))}
                        <p className="text-xs text-red-600 mt-1 font-medium">This vehicle is already scheduled for another booking during this time.</p>
                      </div>
                    )}
                  </div>
                </fieldset>
              )}

              {/* Price */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-900">Pricing</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price-input" className="block mb-2 text-sm font-semibold text-gray-700">Price (€)</label>
                    <div className="relative flex items-center gap-2">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">€</span>
                      <input
                        id="price-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => {
                          setFormData({...formData, price: parseFloat(e.target.value) || 0});
                          setPriceManuallySet(true);
                        }}
                        className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        placeholder="45.00"
                        aria-describedby="price-input-help"
                      />
                      <button
                        type="button"
                        className="ml-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold border border-blue-300 transition-all duration-150"
                        onClick={forceRecalculatePrice}
                        title="Recalculate price using journey and vehicle info"
                      >
                        Recalculate
                      </button>
                    </div>
                    <p id="price-input-help" className="mt-1 text-xs text-gray-600">Total price for this booking. Click 'Recalculate' to update using journey and vehicle info.</p>
                  </div>
                </div>
              </fieldset>
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