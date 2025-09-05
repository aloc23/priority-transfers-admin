import { useState, useMemo, useRef } from "react";
import { useAppStore } from "../context/AppStore";
import { useFleet } from "../context/FleetContext";
import { Link } from "react-router-dom";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatCurrency } from "../utils/currency";
import { CalendarIcon, PlusIcon, InvoiceIcon, CheckIcon, TableIcon, SendIcon } from "../components/Icons";

const localizer = momentLocalizer(moment);

export default function Schedule() {
  const { bookings, addBooking, updateBooking, deleteBooking, customers, drivers, invoices, generateInvoiceFromBooking, markInvoiceAsPaid, sendBookingReminder, currentUser } = useAppStore();
  const { fleet } = useFleet();
  const [showModal, setShowModal] = useState(false);
  const tableRef = useRef(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // Default to 'calendar' view
  const [filterDriver, setFilterDriver] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Booking status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => {
      if (counts[b.status] !== undefined) counts[b.status] += 1;
    });
    return counts;
  }, [bookings]);
  const [formData, setFormData] = useState({
    customer: "",
    pickup: "",
    destination: "",
    date: "",
    time: "",
    driver: "",
    vehicle: "",
    status: "pending",
    type: "priority", // New field for Priority vs Outsourced
    price: 45 // Default price field
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBooking) {
      updateBooking(editingBooking.id, formData);
    } else {
      addBooking(formData);
    }
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
      type: "priority",
      price: 45
    });
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
    let result = bookings;
    if (filterDriver) {
      result = result.filter(booking => booking.driver === filterDriver);
    }
    if (filterStatus !== 'all') {
      result = result.filter(booking => booking.status === filterStatus);
    }
    return result;
  }, [bookings, filterDriver, filterStatus]);

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
          {/* Quick Invoice Creation - Only show for Admin */}
          {currentUser?.role === 'Admin' && (
            <Link
              to="/finance"
              className="btn btn-outline flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <InvoiceIcon className="w-4 h-4" />
              Create Estimate
            </Link>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-floating flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="card mb-2">
        <div className="flex gap-2 md:gap-4 items-center border-b border-slate-200 pb-2 mb-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All', color: 'text-slate-700' },
            { key: 'pending', label: 'Pending', color: 'text-yellow-600' },
            { key: 'confirmed', label: 'Confirmed', color: 'text-green-600' },
            { key: 'completed', label: 'Completed', color: 'text-blue-600' },
            { key: 'cancelled', label: 'Cancelled', color: 'text-red-600' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setFilterStatus(tab.key);
                if (viewMode !== 'table') setViewMode('table');
                setTimeout(() => {
                  if (tableRef.current) {
                    tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              className={`px-3 py-1 rounded-t font-medium border-b-2 transition-all duration-150 flex items-center gap-1 ${
                filterStatus === tab.key
                  ? `${tab.color} border-b-2 border-current bg-slate-50 shadow-sm`
                  : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                filterStatus === tab.key ? 'bg-slate-200' : 'bg-slate-100'
              }`}>
                {statusCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-4 items-center">
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
        <div className="card" ref={tableRef}>
          <div className="overflow-x-auto">
            <table className="table schedule-table-mobile">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Date & Time</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  // Find related invoice if exists
                  const relatedInvoice = invoices.find(inv => inv.bookingId === booking.id);
                  let nextAction = null;
                  let actionHandler = null;
                  let actionLabel = '';
                  let actionColor = '';
                  // Determine next action (best practice workflow)
                  if (booking.status === 'pending') {
                    nextAction = 'confirm';
                    actionLabel = 'Confirm';
                    actionColor = 'btn bg-yellow-500 text-white hover:bg-yellow-600';
                    actionHandler = () => updateBooking(booking.id, { ...booking, status: 'confirmed' });
                  } else if (booking.status === 'confirmed') {
                    nextAction = 'complete';
                    actionLabel = 'Mark as Complete';
                    actionColor = 'btn bg-blue-600 text-white hover:bg-blue-700';
                    actionHandler = () => updateBooking(booking.id, { ...booking, status: 'completed' });
                  } else if (booking.status === 'completed' && !relatedInvoice) {
                    nextAction = 'invoice';
                    actionLabel = 'Generate Invoice';
                    actionColor = 'btn bg-orange-500 text-white hover:bg-orange-600';
                    actionHandler = () => generateInvoiceFromBooking(booking);
                  } else if (relatedInvoice && (relatedInvoice.status === 'pending' || relatedInvoice.status === 'sent')) {
                    nextAction = 'paid';
                    actionLabel = 'Mark as Paid';
                    actionColor = 'btn bg-green-600 text-white hover:bg-green-700';
                    actionHandler = () => markInvoiceAsPaid(relatedInvoice.id);
                  } else if (relatedInvoice && relatedInvoice.status === 'paid') {
                    nextAction = 'none';
                  }
                  return (
                    <tr key={booking.id} className="table-row-animated">
                      <td className="font-medium">{booking.customer}</td>
                      <td className="text-sm">{booking.pickup}</td>
                      <td className="text-sm">{booking.destination}</td>
                      <td className="text-sm">{booking.date} {booking.time}</td>
                      <td className="text-sm">{booking.driver}</td>
                      <td className="text-sm">{booking.vehicle}</td>
                      <td className="text-sm font-semibold text-green-600">
                        {formatCurrency(booking.price || 45)}
                      </td>
                      <td>
                        <span className={`badge badge-animated ${
                          booking.type === 'priority' ? 'badge-blue' : 'badge-yellow'
                        }`}>
                          {booking.type === 'priority' ? 'Priority' : 'Outsourced'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-animated ${
                          booking.status === 'confirmed' ? 'badge-green' :
                          booking.status === 'pending' ? 'badge-yellow' :
                          booking.status === 'completed' ? 'badge-blue' :
                          'badge-red'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(booking)}
                            className="btn btn-outline btn-action px-2 py-1 text-xs"
                            title="Edit Booking"
                          >
                            Edit
                          </button>
                          {nextAction !== 'none' && (
                            <button
                              onClick={actionHandler}
                              className={`${actionColor} btn-action px-2 py-1 text-xs`}
                              title={actionLabel}
                            >
                              {actionLabel}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="btn bg-red-600 text-white hover:bg-red-700 btn-action px-2 py-1 text-xs"
                            title="Delete Booking"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ height: '600px' }} className="calendar-mobile">
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
            <h2 className="text-xl font-bold mb-4">
              {editingBooking ? "Edit Booking" : "New Booking"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    {fleet && fleet.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.name}>
                        {vehicle.name} ({vehicle.type})
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
                <div>
                  <label className="block mb-1">Price (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="input-animated transition-all duration-200 hover:border-purple-400 focus:border-purple-500"
                    placeholder="Enter price..."
                  />
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
                <button type="submit" className="btn btn-primary btn-action">
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
                      type: "priority",
                      price: 45
                    });
                  }}
                  className="btn btn-outline btn-action"
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