import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "../context/AppStore";
import { useAutoSave } from "../utils/operationStatus";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarIcon, PlusIcon } from "../components/Icons";

// Add TableIcon here since it's not in Icons.jsx yet  
const TableIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="3" x2="9" y2="21"/>
  </svg>
);

const localizer = momentLocalizer(moment);

export default function Schedule() {
  const { bookings, addBooking, updateBooking, deleteBooking, customers, drivers, vehicles, showOperationStatus } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [filterDriver, setFilterDriver] = useState('');
  const [formData, setFormData] = useState({
    customer: "",
    pickup: "",
    destination: "",
    date: "",
    time: "",
    driver: "",
    vehicle: "",
    status: "pending",
    type: "priority" // New field for Priority vs Outsourced
  });

  // Auto-save functionality for forms in progress
  const autoSave = useAutoSave(async (data) => {
    // Save draft to localStorage
    const draftKey = editingBooking ? `booking-draft-${editingBooking.id}` : 'booking-draft-new';
    localStorage.setItem(draftKey, JSON.stringify(data));
    return { success: true };
  });

  // Load draft on component mount
  useEffect(() => {
    const draftKey = editingBooking ? `booking-draft-${editingBooking.id}` : 'booking-draft-new';
    const draft = localStorage.getItem(draftKey);
    if (draft && !editingBooking) {
      try {
        const draftData = JSON.parse(draft);
        if (Object.values(draftData).some(v => v && v.trim !== '' && v.trim !== null)) {
          if (confirm('You have an unsaved booking draft. Would you like to restore it?')) {
            setFormData(draftData);
            showOperationStatus('Draft restored successfully', 'success');
          } else {
            localStorage.removeItem(draftKey);
          }
        }
      } catch (error) {
        console.warn('Failed to load draft:', error);
      }
    }
  }, [editingBooking, showOperationStatus]);

  // Auto-save when form data changes
  useEffect(() => {
    if (Object.values(formData).some(v => v && v.trim && v.trim() !== '')) {
      autoSave.save(formData);
    }
  }, [formData, autoSave]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingBooking) {
        result = await updateBooking(editingBooking.id, formData);
      } else {
        result = await addBooking(formData);
      }
      
      if (result && result.success) {
        // Clear draft on successful save
        const draftKey = editingBooking ? `booking-draft-${editingBooking.id}` : 'booking-draft-new';
        localStorage.removeItem(draftKey);
        
        setShowModal(false);
        setEditingBooking(null);
        setFormData({
          customer: "",
          pickup: "",
          destination: "",
          date: "",
          time: "",
          driver: "",
          vehicle: "",
          status: "pending",
          type: "priority"
        });
      } else {
        showOperationStatus(result?.error || 'Failed to save booking', 'error');
      }
    } catch (error) {
      showOperationStatus('An error occurred while saving', 'error');
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData(booking);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteBooking(id);
    }
  };

  // Memoize filtered bookings for performance
  const filteredBookings = useMemo(() => {
    return filterDriver 
      ? bookings.filter(booking => booking.driver === filterDriver)
      : bookings;
  }, [bookings, filterDriver]);

  // Memoize calendar events for performance
  const calendarEvents = useMemo(() => {
    return filteredBookings.map(booking => ({
      id: booking.id,
      title: `${booking.customer} - ${booking.pickup} → ${booking.destination}`,
      start: moment(`${booking.date} ${booking.time}`).toDate(),
      end: moment(`${booking.date} ${booking.time}`).add(1, 'hour').toDate(),
      resource: booking,
      style: {
        backgroundColor: booking.type === 'priority' ? '#3b82f6' : '#f59e0b',
        borderColor: booking.type === 'priority' ? '#1d4ed8' : '#d97706',
        color: 'white'
      }
    }));
  }, [filteredBookings]);

  const handleSelectEvent = (event) => {
    handleEdit(event.resource);
  };

  const handleSelectSlot = ({ start }) => {
    const date = moment(start).format('YYYY-MM-DD');
    const time = moment(start).format('HH:mm');
    setFormData({
      ...formData,
      date,
      time
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            className="btn btn-outline flex items-center gap-2"
          >
            {viewMode === 'table' ? (
              <>
                <CalendarIcon className="w-4 h-4" />
                Calendar View
              </>
            ) : (
              <>
                <TableIcon className="w-4 h-4" />
                Table View
              </>
            )}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Driver</label>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All Drivers</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.name}>{driver.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Priority Transfers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Outsourced</span>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Date & Time</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-medium">{booking.customer}</td>
                    <td className="text-sm">{booking.pickup}</td>
                    <td className="text-sm">{booking.destination}</td>
                    <td className="text-sm">{booking.date} {booking.time}</td>
                    <td className="text-sm">{booking.driver}</td>
                    <td className="text-sm">{booking.vehicle}</td>
                    <td>
                      <span className={`badge ${
                        booking.type === 'priority' ? 'badge-blue' : 'badge-yellow'
                      }`}>
                        {booking.type === 'priority' ? 'Priority' : 'Outsourced'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        booking.status === 'confirmed' ? 'badge-green' :
                        booking.status === 'pending' ? 'badge-yellow' :
                        booking.status === 'completed' ? 'badge-blue' :
                        'badge-red'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="btn btn-outline px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              views={['month', 'week', 'day']}
              defaultView="month"
              eventPropGetter={(event) => ({
                style: event.style
              })}
              popup
            />
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingBooking ? "Edit Booking" : "New Booking"}
              </h2>
              {/* Save Status Indicator */}
              <div className="text-sm">
                {autoSave.isSaving ? (
                  <span className="text-blue-600 flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving draft...
                  </span>
                ) : autoSave.lastSaved ? (
                  <span className="text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Draft saved {autoSave.lastSaved.toLocaleTimeString()}
                  </span>
                ) : (
                  <span className="text-gray-500">Draft auto-save enabled</span>
                )}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Customer</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Driver</label>
                  <select
                    value={formData.driver}
                    onChange={(e) => setFormData({...formData, driver: e.target.value})}
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.name}>{driver.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={formData.pickup}
                  onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Vehicle</label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={`${vehicle.make} ${vehicle.model}`}>
                        {vehicle.make} {vehicle.model} ({vehicle.license})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Booking Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="priority">Priority Transfers</option>
                    <option value="outsourced">Outsourced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingBooking ? "Update" : "Create"} Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBooking(null);
                    setFormData({
                      customer: "",
                      pickup: "",
                      destination: "",
                      date: "",
                      time: "",
                      driver: "",
                      vehicle: "",
                      status: "pending",
                      type: "priority"
                    });
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