import { useState, useMemo, useRef } from "react";
import { useAppStore } from "../context/AppStore";
import { useFleet } from "../context/FleetContext";
import { useResponsive } from "../hooks/useResponsive";
import { Link } from "react-router-dom";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatCurrency } from "../utils/currency";
import { CalendarIcon, PlusIcon, InvoiceIcon, CheckIcon, TableIcon, SendIcon } from "../components/Icons";
import PageHeader from "../components/PageHeader";
import StatusBlockGrid from "../components/StatusBlockGrid";
import ToggleSwitch from "../components/ToggleSwitch";

const localizer = momentLocalizer(moment);

export default function Schedule() {
  // State for selected booking (for calendar card popup)
  const [selectedCalendarBooking, setSelectedCalendarBooking] = useState(null);
  const { bookings, addBooking, updateBooking, deleteBooking, customers, drivers, invoices, generateInvoiceFromBooking, markInvoiceAsPaid, sendBookingReminder, currentUser } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();
  const [showModal, setShowModal] = useState(false);
  const tableRef = useRef(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // Default to 'calendar' view
  const [filterDriver, setFilterDriver] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [highlightedBooking, setHighlightedBooking] = useState(null);

  // Booking status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => {
      if (counts[b.status] !== undefined) counts[b.status] += 1;
    });
    return counts;
  }, [bookings]);

  // Combined booking/invoice status logic (same as Dashboard)
  const getCombinedStatus = (booking) => {
    const inv = invoices.find(inv => inv.bookingId === booking.id);
    if (booking.status === 'pending') return 'Pending';
    if (booking.status === 'confirmed') return 'Confirmed';
    if (booking.status === 'completed' && !inv) return 'Completed';
    if (inv && (inv.status === 'pending' || inv.status === 'sent')) return 'Invoiced';
    if (inv && inv.status === 'paid') return 'Paid';
    if (inv && inv.status === 'overdue') return 'Overdue';
    if (booking.status === 'cancelled') return 'Cancelled';
    return 'Other';
  };

  const combinedStatusList = ['Pending', 'Confirmed', 'Completed', 'Invoiced', 'Paid', 'Overdue', 'Cancelled'];
  const combinedStatusColors = {
    Pending: 'bg-gradient-to-r from-amber-600 to-yellow-500',
    Confirmed: 'bg-gradient-to-r from-green-600 to-emerald-500',
    Completed: 'bg-gradient-to-r from-blue-600 to-indigo-500',
    Invoiced: 'bg-gradient-to-r from-orange-500 to-yellow-400',
    Paid: 'bg-gradient-to-r from-blue-700 to-green-500',
    Overdue: 'bg-gradient-to-r from-red-600 to-pink-500',
    Cancelled: 'bg-gradient-to-r from-slate-400 to-slate-600',
    Other: 'bg-gradient-to-r from-slate-300 to-slate-400'
  };

  const bookingsByCombinedStatus = useMemo(() => {
    const map = {};
    combinedStatusList.forEach(status => { map[status] = []; });
    bookings.forEach(b => {
      const status = getCombinedStatus(b);
      if (!map[status]) map[status] = [];
      map[status].push(b);
    });
    return map;
  }, [bookings, invoices]);

  const [selectedCombinedStatus, setSelectedCombinedStatus] = useState(null);
  const [formData, setFormData] = useState({
    customer: "",
    pickup: "",
    destination: "",
    date: "",
    time: "",
    driver: "",
    vehicle: "",
    partner: "", // For outsourced bookings
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
      partner: "",
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

  // Function to handle actions with auto-scroll and highlight
  const handleActionWithScroll = (action, bookingId) => {
    // Execute the action
    action();
    
    // Highlight the booking
    setHighlightedBooking(bookingId);
    
    // Scroll to the booking row after a small delay to allow for state updates
    setTimeout(() => {
      const bookingElement = document.getElementById(`booking-${bookingId}`);
      if (bookingElement) {
        bookingElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedBooking(null);
      }, 3000);
    }, 100);
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

  // Render mobile card for schedule items
  const renderMobileCard = (booking) => {
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
      <div 
        key={booking.id} 
        id={`booking-${booking.id}`}
        className={`schedule-card ${highlightedBooking === booking.id ? 'bg-yellow-50 border-yellow-300 shadow-lg' : ''} transition-all duration-500`}
      >
        <div className="schedule-card-header">
          <div>
            <h3 className="font-semibold text-lg text-slate-800 mb-1">{booking.customer}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge badge-animated ${
                booking.status === 'confirmed' ? 'badge-green' :
                booking.status === 'pending' ? 'badge-yellow' :
                booking.status === 'completed' ? 'badge-blue' :
                'badge-red'
              }`}>
                {booking.status}
              </span>
              <span className={`badge badge-animated ${
                booking.type === 'priority' ? 'badge-blue' : 'badge-yellow'
              }`}>
                {booking.type === 'priority' ? 'Priority' : 'Outsourced'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(booking.price || 45)}
            </div>
            <div className="text-sm text-slate-500">
              {booking.date} {booking.time}
            </div>
          </div>
        </div>
        
        <div className="schedule-card-content">
          <div className="grid grid-cols-1 gap-2">
            <div className="text-sm">
              <span className="font-medium text-slate-600">Route:</span> {booking.pickup} → {booking.destination}
            </div>
            <div className="text-sm">
              <span className="font-medium text-slate-600">Driver:</span> {booking.driver}
            </div>
            <div className="text-sm">
              <span className="font-medium text-slate-600">Vehicle:</span> {booking.vehicle}
            </div>
          </div>
        </div>
        
        <div className="schedule-card-actions">
          <button
            onClick={() => handleEdit(booking)}
            className="btn btn-outline btn-action px-3 py-2 text-sm flex-1"
          >
            Edit
          </button>
          {nextAction !== 'none' && (
            <button
              onClick={() => handleActionWithScroll(actionHandler, booking.id)}
              className={`${actionColor} btn-action px-3 py-2 text-sm flex-1`}
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={() => handleDelete(booking.id)}
            className="btn bg-red-600 text-white hover:bg-red-700 btn-action px-3 py-2 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const scheduleActions = (
    <>
      <ToggleSwitch 
        leftLabel="Table"
        rightLabel="Calendar"
        leftIcon={TableIcon}
        rightIcon={CalendarIcon}
        isRight={viewMode === 'calendar'}
        onChange={(isCalendar) => setViewMode(isCalendar ? 'calendar' : 'table')}
      />
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
    </>
  );

  const statusTabs = [
    { id: 'all', label: 'All', count: statusCounts.all },
    { id: 'pending', label: 'Pending', count: statusCounts.pending },
    { id: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
    { id: 'completed', label: 'Completed', count: statusCounts.completed },
    { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
  ];


  return (
  <div className="space-y-4">
      <PageHeader
        title="Schedule"
        plain={true}
        className="mb-2"
      />

    {/* Status Blocks - Booking status only */}
      <div className="mb-2">
        <StatusBlockGrid
          title="Booking Status"
          statusData={statusTabs.filter(tab => tab.id !== 'all').map(tab => ({
            id: tab.id,
            label: tab.label,
            count: tab.count,
            color:
              tab.id === 'pending' ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-yellow-100'
              : tab.id === 'confirmed' ? 'bg-gradient-to-r from-green-400 via-emerald-200 to-green-100'
              : tab.id === 'completed' ? 'bg-gradient-to-r from-blue-400 via-indigo-200 to-blue-100'
              : tab.id === 'cancelled' ? 'bg-gradient-to-r from-slate-400 via-slate-200 to-slate-100'
              : 'bg-gradient-to-r from-slate-200 to-slate-100'
          }))}
          selectedStatus={filterStatus}
          onStatusClick={setFilterStatus}
          cardClassName="backdrop-blur-md bg-white/80 border border-slate-200 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-200 group"
          countClassName="text-2xl font-extrabold text-slate-900 drop-shadow-sm"
          labelClassName="text-xs font-bold text-slate-700 uppercase tracking-wider"
        />
      </div>



      {/* Status Filters - moved below switcher */}
      <div className="border-b border-slate-200 mb-2">
        <nav className="flex flex-wrap gap-1 md:gap-0 md:space-x-6 px-2 md:px-0" aria-label="Status Filter Tabs">
          {statusTabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)} 
              className={`py-2 px-3 md:py-1 md:px-1 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 min-h-[36px] flex items-center justify-center md:min-h-auto flex-1 md:flex-none ${
                filterStatus === tab.id 
                  ? 'border-blue-500 text-blue-600 bg-blue-50 md:bg-transparent shadow-sm md:shadow-none' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:hover:bg-transparent'
              }`}
              aria-selected={filterStatus === tab.id}
              role="tab"
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>


  {viewMode === 'table' ? (
        isMobile ? (
          <div className="space-y-2">
            {/* Sticky section header for mobile */}
            <div className="sticky-header mb-1">
              <h2 className="text-lg font-semibold text-slate-800">
                {filterStatus === 'all' ? 'All Bookings' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Bookings`}
                <span className="ml-2 text-sm text-slate-500">
                  ({filteredBookings.length} items)
                </span>
              </h2>
            </div>
            {/* Table/Calendar Switcher, Add Booking, and Filters for mobile, above cards */}
            <div className="mb-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ToggleSwitch 
                  leftLabel="Table"
                  rightLabel="Calendar"
                  leftIcon={TableIcon}
                  rightIcon={CalendarIcon}
                  isRight={viewMode === 'calendar'}
                  onChange={(isCalendar) => setViewMode(isCalendar ? 'calendar' : 'table')}
                />
                <button 
                  className="btn btn-primary gap-2 font-medium hover:scale-105 transition-transform duration-200" 
                  onClick={() => setShowModal(true)}
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Booking</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">Filter by Driver</label>
                  <select
                    value={filterDriver}
                    onChange={(e) => setFilterDriver(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">All Drivers</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.name}>{driver.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 items-center text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Priority</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Outsourced</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile cards */}
            {filteredBookings.map(renderMobileCard)}
            {filteredBookings.length === 0 && (
              <div className="text-center py-6 text-slate-500">
                No bookings found for the selected filters.
              </div>
            )}
          </div>
        ) : (
          <div className="card p-4" ref={tableRef}>
            {/* Table/Calendar Switcher, Add Booking, and Filters for desktop, above table */}
            <div className="mb-1 flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <ToggleSwitch 
                  leftLabel="Table"
                  rightLabel="Calendar"
                  leftIcon={TableIcon}
                  rightIcon={CalendarIcon}
                  isRight={viewMode === 'calendar'}
                  onChange={(isCalendar) => setViewMode(isCalendar ? 'calendar' : 'table')}
                />
                <button 
                  className="btn btn-primary gap-2 font-medium hover:scale-105 transition-transform duration-200" 
                  onClick={() => setShowModal(true)}
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Booking</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">Filter by Driver</label>
                  <select
                    value={filterDriver}
                    onChange={(e) => setFilterDriver(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">All Drivers</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.name}>{driver.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 items-center text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Priority</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Outsourced</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table schedule-table-mobile">
                <thead className="sticky top-0 bg-white z-10">
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
                    // ...existing code...
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
                      <tr 
                        key={booking.id} 
                        id={`booking-${booking.id}`}
                        className={`table-row-animated ${highlightedBooking === booking.id ? 'bg-yellow-50 border-yellow-300' : ''} transition-all duration-500`}
                      >
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
                                onClick={() => handleActionWithScroll(actionHandler, booking.id)}
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
        )
      ) : (
        <div className="card p-4">
          {/* Table/Calendar Switcher, Add Booking, and Filters for calendar view, above calendar */}
          <div className="mb-1 flex flex-wrap items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <ToggleSwitch 
                leftLabel="Table"
                rightLabel="Calendar"
                leftIcon={TableIcon}
                rightIcon={CalendarIcon}
                isRight={viewMode === 'calendar'}
                onChange={(isCalendar) => setViewMode(isCalendar ? 'calendar' : 'table')}
              />
              <button 
                className="btn btn-primary gap-2 font-medium hover:scale-105 transition-transform duration-200" 
                onClick={() => setShowModal(true)}
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add Booking</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Filter by Driver</label>
                <select
                  value={filterDriver}
                  onChange={(e) => setFilterDriver(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">All Drivers</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.name}>{driver.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Priority</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Outsourced</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ height: '600px' }} className="calendar-mobile relative">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={(event) => setSelectedCalendarBooking(event.resource)}
              onSelectSlot={handleSelectSlot}
              selectable
              views={['month', 'week', 'day']}
              defaultView="month"
              eventPropGetter={(event) => ({
                style: event.style
              })}
              popup
              components={{
                event: ({ event }) => {
                  // Render a small dot, color-coded by status
                  const status = getCombinedStatus(event.resource || event);
                  const colorMap = {
                    Pending: '#fbbf24',
                    Confirmed: '#22c55e',
                    Completed: '#3b82f6',
                    Invoiced: '#f59e42',
                    Paid: '#2563eb',
                    Overdue: '#ef4444',
                    Cancelled: '#64748b',
                    Other: '#a3a3a3'
                  };
                  return (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 16 }}>
                      <span style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: colorMap[status] || '#a3a3a3',
                        margin: 2
                      }} />
                    </span>
                  );
                }
              }}
            />
            {/* Booking Card Popup */}
            {selectedCalendarBooking && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={() => setSelectedCalendarBooking(null)}>
                <div className="bg-white rounded-xl shadow-xl p-6 min-w-[320px] max-w-[90vw] relative" onClick={e => e.stopPropagation()}>
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-slate-100`} style={{background: combinedStatusColors[getCombinedStatus(selectedCalendarBooking)] || '#f3f4f6', color: '#222'}}>
                      {getCombinedStatus(selectedCalendarBooking)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                      {selectedCalendarBooking.customer?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-base">{selectedCalendarBooking.customer}</div>
                      <div className="text-xs text-slate-500">{selectedCalendarBooking.pickup} → {selectedCalendarBooking.destination}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    <span className="font-medium">Date:</span> {selectedCalendarBooking.date} {selectedCalendarBooking.time}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs"><span className="font-medium">Driver:</span> {selectedCalendarBooking.driver}</span>
                    <span className="text-xs"><span className="font-medium">Vehicle:</span> {selectedCalendarBooking.vehicle}</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs"><span className="font-medium">Type:</span> {selectedCalendarBooking.type === 'priority' ? 'Priority' : 'Outsourced'}</span>
                    <span className="text-xs"><span className="font-medium">Price:</span> {formatCurrency(selectedCalendarBooking.price || 45)}</span>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2">
                    {/* Render action button based on status */}
                    {(() => {
                      const status = selectedCalendarBooking.status;
                      const inv = invoices.find(inv => inv.bookingId === selectedCalendarBooking.id);
                      if (status === 'pending') {
                        return <button className="btn btn-success flex-1" onClick={() => { updateBooking(selectedCalendarBooking.id, { ...selectedCalendarBooking, status: 'confirmed' }); setSelectedCalendarBooking(null); }}>Confirm</button>;
                      } else if (status === 'confirmed') {
                        return <button className="btn btn-primary flex-1" onClick={() => { updateBooking(selectedCalendarBooking.id, { ...selectedCalendarBooking, status: 'completed' }); setSelectedCalendarBooking(null); }}>Mark as Complete</button>;
                      } else if (status === 'completed' && !inv) {
                        return <button className="btn btn-warning flex-1" onClick={() => { generateInvoiceFromBooking(selectedCalendarBooking); setSelectedCalendarBooking(null); }}>Generate Invoice</button>;
                      } else if (inv && (inv.status === 'pending' || inv.status === 'sent')) {
                        return <button className="btn btn-success flex-1" onClick={() => { markInvoiceAsPaid(inv.id); setSelectedCalendarBooking(null); }}>Mark as Paid</button>;
                      } else if (inv && inv.status === 'paid') {
                        return <span className="btn btn-disabled flex-1">Paid</span>;
                      }
                      return null;
                    })()}
                    <button className="btn btn-outline flex-1" onClick={() => setSelectedCalendarBooking(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}
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
                {formData.type === 'priority' && (
                  <div>
                    <label className="block mb-1">Driver</label>
                    <select
                      value={formData.driver}
                      onChange={(e) => setFormData({...formData, driver: e.target.value})}
                      required={formData.type === 'priority'}
                    >
                      <option value="">Select Driver</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.name}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                )}
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
                {formData.type === 'priority' && (
                  <div>
                    <label className="block mb-1">Vehicle</label>
                    <select
                      value={formData.vehicle}
                      onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                      required={formData.type === 'priority'}
                    >
                      <option value="">Select Vehicle</option>
                      {fleet && fleet.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.name}>
                          {vehicle.name} ({vehicle.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block mb-1">Booking Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="priority">Priority Transfers</option>
                    <option value="outsourced">Outsourced/Partner</option>
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
                      partner: "",
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
