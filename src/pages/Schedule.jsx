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
import BookingModal from "../components/BookingModal";

const localizer = momentLocalizer(moment);

// Helper function to get booking type display
const getBookingTypeDisplay = (type) => {
  switch (type) {
    case 'single':
      return 'Transfer';
    case 'tour':
      return 'Tour';
    case 'outsourced':
      return 'Outsourced';
    case 'priority': // For backwards compatibility with existing data
      return 'Transfer';
    default:
      return 'Transfer';
  }
};

// Helper function to get booking type color
const getBookingTypeColor = (type) => {
  switch (type) {
    case 'single':
    case 'priority': // For backwards compatibility
      return { bg: '#3b82f6', border: '#1d4ed8', badge: 'badge-blue' };
    case 'tour':
      return { bg: '#10b981', border: '#047857', badge: 'badge-green' };
    case 'outsourced':
      return { bg: '#f59e0b', border: '#d97706', badge: 'badge-yellow' };
    default:
      return { bg: '#3b82f6', border: '#1d4ed8', badge: 'badge-blue' };
  }
};

export default function Schedule() {
  // State for selected booking (for calendar card popup)
  const [selectedCalendarBooking, setSelectedCalendarBooking] = useState(null);
  const { bookings, addBooking, updateBooking, deleteBooking, customers, drivers, invoices, generateInvoiceFromBooking, markInvoiceAsPaid, sendBookingReminder, currentUser, globalCalendarState, updateGlobalCalendarState } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();
  const [showModal, setShowModal] = useState(false);
  const tableRef = useRef(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // Default to 'calendar' view
  const [highlightedBooking, setHighlightedBooking] = useState(null);

  // Use global calendar state instead of local state  
  const { selectedDate, selectedStatus, selectedDriver } = globalCalendarState;
  const filterStatus = selectedStatus === null ? 'all' : selectedStatus;

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
  const [initialDate, setInitialDate] = useState('');
  const [initialTime, setInitialTime] = useState('');

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setInitialDate('');
    setInitialTime('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBooking(null);
    setInitialDate('');
    setInitialTime('');
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
    if (selectedDriver) {
      result = result.filter(booking => booking.driver === selectedDriver);
    }
    if (filterStatus !== 'all') {
      result = result.filter(booking => booking.status === filterStatus);
    }
    return result;
  }, [bookings, selectedDriver, filterStatus]);

  // Memoize calendar events for performance - ONLY show confirmed bookings
  const calendarEvents = useMemo(() => {
    // Filter to only include confirmed bookings for calendar display
    const confirmedBookings = filteredBookings.filter(booking => booking.status === 'confirmed');
    
    const events = [];
    
    confirmedBookings.forEach(booking => {
      if (booking.type === 'tour') {
        // Handle tour bookings with date ranges
        if (booking.tourStartDate && booking.tourEndDate) {
          const tourStart = moment(`${booking.tourStartDate} ${booking.tourPickupTime || '08:00'}`);
          const tourEnd = moment(`${booking.tourEndDate} ${booking.tourReturnPickupTime || '18:00'}`);
          
          events.push({
            id: `${booking.id}-tour`,
            title: `🚌 Tour: ${booking.customer} - ${booking.pickup} → ${booking.destination}`,
            start: tourStart.toDate(),
            end: tourEnd.toDate(),
            allDay: tourStart.clone().startOf('day').isSame(tourEnd.clone().startOf('day')) ? false : true,
            resource: { ...booking, legType: 'tour' },
            style: {
              backgroundColor: getBookingTypeColor(booking.type).bg,
              borderColor: getBookingTypeColor(booking.type).border,
              color: 'white',
              fontWeight: 'bold'
            }
          });
        }
      } else {
        // Handle single/transfer bookings
        if (booking.date && booking.time) {
          events.push({
            id: `${booking.id}-pickup`,
            title: `${getBookingTypeDisplay(booking.type)}: ${booking.customer} - ${booking.pickup} → ${booking.destination}`,
            start: moment(`${booking.date} ${booking.time}`).toDate(),
            end: moment(`${booking.date} ${booking.time}`).add(2, 'hours').toDate(),
            resource: { ...booking, isReturn: false, legType: 'pickup' },
            style: {
              backgroundColor: getBookingTypeColor(booking.type).bg,
              borderColor: getBookingTypeColor(booking.type).border,
              color: 'white'
            }
          });
          
          // Add return event if applicable
          if (booking.hasReturn && booking.returnDate && booking.returnTime) {
            events.push({
              id: `${booking.id}-return`,
              title: `Return: ${booking.customer} - ${booking.returnPickup || booking.destination} → ${booking.pickup}`,
              start: moment(`${booking.returnDate} ${booking.returnTime}`).toDate(),
              end: moment(`${booking.returnDate} ${booking.returnTime}`).add(2, 'hours').toDate(),
              resource: { ...booking, isReturn: true, legType: 'return' },
              style: {
                backgroundColor: getBookingTypeColor(booking.type).bg,
                borderColor: getBookingTypeColor(booking.type).border,
                color: 'white',
                borderStyle: 'dashed', // Distinguish return trips visually
                borderWidth: '2px'
              }
            });
          }
        }
      }
    });
    
    return events;
  }, [filteredBookings]);

  const handleSelectEvent = (event) => {
    handleEdit(event.resource);
  };

  const handleSelectSlot = ({ start }) => {
    const date = moment(start).format('YYYY-MM-DD');
    const time = moment(start).format('HH:mm');
    setInitialDate(date);
    setInitialTime(time);
    setEditingBooking(null);
    setShowModal(true);
  };

  // Render mobile card for schedule items
  const renderMobileCard = (booking) => {
    // Find related invoice if exists
    const relatedInvoice = invoices.find(inv => inv.bookingId === booking.id);
    const actions = [];
    
    // Determine available actions based on booking status and completion states
    if (booking.status === 'pending') {
      actions.push({
        label: 'Confirm',
        handler: () => updateBooking(booking.id, { ...booking, status: 'confirmed' }),
        color: 'btn bg-yellow-500 text-white hover:bg-yellow-600'
      });
    } else if (booking.status === 'confirmed') {
      // For confirmed bookings, show pickup and return completion actions
      if (!booking.pickupCompleted) {
        actions.push({
          label: 'Complete Pickup',
          handler: () => updateBooking(booking.id, { ...booking, pickupCompleted: true }),
          color: 'btn bg-blue-600 text-white hover:bg-blue-700'
        });
      } else if (booking.hasReturn && !booking.returnCompleted) {
        // Only show return completion if pickup is complete
        actions.push({
          label: 'Complete Return',
          handler: () => updateBooking(booking.id, { ...booking, returnCompleted: true, status: 'completed' }),
          color: 'btn bg-green-600 text-white hover:bg-green-700'
        });
      } else if (!booking.hasReturn) {
        // For single trips, complete the entire booking when pickup is done
        actions.push({
          label: 'Mark as Complete',
          handler: () => updateBooking(booking.id, { ...booking, status: 'completed' }),
          color: 'btn bg-green-600 text-white hover:bg-green-700'
        });
      }
    } else if (booking.status === 'completed' && !relatedInvoice) {
      actions.push({
        label: 'Generate Invoice',
        handler: () => generateInvoiceFromBooking(booking),
        color: 'btn bg-orange-500 text-white hover:bg-orange-600'
      });
    } else if (relatedInvoice && (relatedInvoice.status === 'pending' || relatedInvoice.status === 'sent')) {
      actions.push({
        label: 'Mark as Paid',
        handler: () => markInvoiceAsPaid(relatedInvoice.id),
        color: 'btn bg-green-600 text-white hover:bg-green-700'
      });
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
              <span className={`badge badge-animated ${getBookingTypeColor(booking.type).badge}`}>
                {getBookingTypeDisplay(booking.type)}
              </span>
              {/* Show completion status for confirmed bookings */}
              {booking.status === 'confirmed' && (
                <div className="flex items-center gap-1 text-xs">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.pickupCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Pickup {booking.pickupCompleted ? '✓' : '○'}
                  </span>
                  {booking.hasReturn && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.returnCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Return {booking.returnCompleted ? '✓' : '○'}
                    </span>
                  )}
                </div>
              )}
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
            {/* Show return trip info if exists */}
            {booking.hasReturn && booking.returnDate && (
              <div className="text-sm pt-2 border-t border-gray-200">
                <div className="font-medium text-slate-600 mb-1">Return Trip:</div>
                <div className="text-xs text-slate-500">
                  <div>Date: {booking.returnDate} at {booking.returnTime}</div>
                  {booking.returnPickup && <div>From: {booking.returnPickup}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="schedule-card-actions">
          <button
            onClick={() => handleEdit(booking)}
            className="btn btn-outline btn-action px-3 py-2 text-sm flex-1"
          >
            Edit
          </button>
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleActionWithScroll(action.handler, booking.id)}
              className={`${action.color} btn-action px-3 py-2 text-sm flex-1`}
            >
              {action.label}
            </button>
          ))}
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
          onStatusClick={(status) => updateGlobalCalendarState({ selectedStatus: status === 'all' ? null : status })}
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
              onClick={() => updateGlobalCalendarState({ selectedStatus: tab.id === 'all' ? null : tab.id })} 
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
                    value={selectedDriver}
                    onChange={(e) => updateGlobalCalendarState({ selectedDriver: e.target.value })}
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
                    value={selectedDriver}
                    onChange={(e) => updateGlobalCalendarState({ selectedDriver: e.target.value })}
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
                    // Find related invoice if exists
                    const relatedInvoice = invoices.find(inv => inv.bookingId === booking.id);
                    const actions = [];
                    
                    // Determine available actions based on booking status and completion states
                    if (booking.status === 'pending') {
                      actions.push({
                        label: 'Confirm',
                        handler: () => updateBooking(booking.id, { ...booking, status: 'confirmed' }),
                        color: 'btn bg-yellow-500 text-white hover:bg-yellow-600'
                      });
                    } else if (booking.status === 'confirmed') {
                      // For confirmed bookings, show pickup and return completion actions
                      if (!booking.pickupCompleted) {
                        actions.push({
                          label: 'Complete Pickup',
                          handler: () => updateBooking(booking.id, { ...booking, pickupCompleted: true }),
                          color: 'btn bg-blue-600 text-white hover:bg-blue-700'
                        });
                      } else if (booking.hasReturn && !booking.returnCompleted) {
                        // Only show return completion if pickup is complete
                        actions.push({
                          label: 'Complete Return',
                          handler: () => updateBooking(booking.id, { ...booking, returnCompleted: true, status: 'completed' }),
                          color: 'btn bg-green-600 text-white hover:bg-green-700'
                        });
                      } else if (!booking.hasReturn) {
                        // For single trips, complete the entire booking when pickup is done
                        actions.push({
                          label: 'Mark as Complete',
                          handler: () => updateBooking(booking.id, { ...booking, status: 'completed' }),
                          color: 'btn bg-green-600 text-white hover:bg-green-700'
                        });
                      }
                    } else if (booking.status === 'completed' && !relatedInvoice) {
                      actions.push({
                        label: 'Generate Invoice',
                        handler: () => generateInvoiceFromBooking(booking),
                        color: 'btn bg-orange-500 text-white hover:bg-orange-600'
                      });
                    } else if (relatedInvoice && (relatedInvoice.status === 'pending' || relatedInvoice.status === 'sent')) {
                      actions.push({
                        label: 'Mark as Paid',
                        handler: () => markInvoiceAsPaid(relatedInvoice.id),
                        color: 'btn bg-green-600 text-white hover:bg-green-700'
                      });
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
                          <span className={`badge badge-animated ${getBookingTypeColor(booking.type).badge}`}>
                            {getBookingTypeDisplay(booking.type)}
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <span className={`badge badge-animated ${
                              booking.status === 'confirmed' ? 'badge-green' :
                              booking.status === 'pending' ? 'badge-yellow' :
                              booking.status === 'completed' ? 'badge-blue' :
                              'badge-red'
                            }`}>
                              {booking.status}
                            </span>
                            {/* Show completion status for confirmed bookings */}
                            {booking.status === 'confirmed' && (
                              <div className="flex gap-1 text-xs">
                                <span className={`px-1 py-0.5 rounded text-xs ${
                                  booking.pickupCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  P{booking.pickupCompleted ? '✓' : '○'}
                                </span>
                                {booking.hasReturn && (
                                  <span className={`px-1 py-0.5 rounded text-xs ${
                                    booking.returnCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    R{booking.returnCompleted ? '✓' : '○'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1 flex-wrap">
                            <button
                              onClick={() => handleEdit(booking)}
                              className="btn btn-outline btn-action px-2 py-1 text-xs"
                              title="Edit Booking"
                            >
                              Edit
                            </button>
                            {actions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionWithScroll(action.handler, booking.id)}
                                className={`${action.color} btn-action px-2 py-1 text-xs`}
                                title={action.label}
                              >
                                {action.label}
                              </button>
                            ))}
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
                  value={selectedDriver}
                  onChange={(e) => updateGlobalCalendarState({ selectedDriver: e.target.value })}
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
                  {/* Show completion status for confirmed bookings */}
                  {selectedCalendarBooking.status === 'confirmed' && (
                    <div className="flex gap-2 mb-2 text-xs">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        selectedCalendarBooking.pickupCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        Pickup {selectedCalendarBooking.pickupCompleted ? '✓' : '○'}
                      </span>
                      {selectedCalendarBooking.hasReturn && (
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          selectedCalendarBooking.returnCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          Return {selectedCalendarBooking.returnCompleted ? '✓' : '○'}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Show return trip info if this is a return leg */}
                  {selectedCalendarBooking.legType === 'return' && selectedCalendarBooking.returnDate && (
                    <div className="mb-2 p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                      <div className="text-xs font-semibold text-cyan-800 mb-1">Return Trip Details</div>
                      <div className="text-xs text-cyan-700">
                        <div>Return Date: {selectedCalendarBooking.returnDate} at {selectedCalendarBooking.returnTime}</div>
                        {selectedCalendarBooking.returnPickup && <div>From: {selectedCalendarBooking.returnPickup}</div>}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs"><span className="font-medium">Type:</span> {getBookingTypeDisplay(selectedCalendarBooking.type)}</span>
                    <span className="text-xs"><span className="font-medium">Price:</span> {formatCurrency(selectedCalendarBooking.price || 45)}</span>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2">
                    {/* Render action button based on status and completion state */}
                    {(() => {
                      const status = selectedCalendarBooking.status;
                      const inv = invoices.find(inv => inv.bookingId === selectedCalendarBooking.id);
                      const actions = [];
                      
                      if (status === 'pending') {
                        actions.push(
                          <button key="confirm" className="btn btn-success flex-1" onClick={() => { 
                            updateBooking(selectedCalendarBooking.id, { ...selectedCalendarBooking, status: 'confirmed' }); 
                            setSelectedCalendarBooking(null); 
                          }}>Confirm</button>
                        );
                      } else if (status === 'confirmed') {
                        // Handle return transfer bookings with proper leg differentiation
                        if (selectedCalendarBooking.hasReturn) {
                          const legType = selectedCalendarBooking.legType;
                          
                          if (legType === 'pickup' && !selectedCalendarBooking.pickupCompleted) {
                            // Only show "Complete Pickup" for pickup leg when pickup not completed
                            actions.push(
                              <button key="pickup" className="btn btn-primary flex-1" onClick={() => { 
                                updateBooking(selectedCalendarBooking.id, { ...selectedCalendarBooking, pickupCompleted: true }); 
                                setSelectedCalendarBooking(null); 
                              }}>Complete Pickup</button>
                            );
                          } else if (legType === 'return') {
                            if (selectedCalendarBooking.pickupCompleted && !selectedCalendarBooking.returnCompleted) {
                              // Only show "Complete" for return leg when pickup is completed
                              actions.push(
                                <button key="return" className="btn btn-success flex-1" onClick={() => { 
                                  updateBooking(selectedCalendarBooking.id, { ...selectedCalendarBooking, returnCompleted: true, status: 'completed' }); 
                                  setSelectedCalendarBooking(null); 
                                }}>Complete</button>
                              );
                            } else if (!selectedCalendarBooking.pickupCompleted) {
                              // Show informational message for return leg when pickup not completed
                              actions.push(
                                <div key="waiting" className="btn btn-disabled flex-1 bg-yellow-100 text-yellow-800 cursor-not-allowed">
                                  Waiting for pickup completion
                                </div>
                              );
                            }
                          } else if (!legType) {
                            // Fallback for general booking view (no specific leg)
                            if (!selectedCalendarBooking.pickupCompleted) {
                              actions.push(
                                <button key="pickup" className="btn btn-primary flex-1" onClick={() => { 
                                  updateBooking(selectedCalendarBooking.id, { ...selectedCalendarBooking, pickupCompleted: true }); 
                                  setSelectedCalendarBooking(null); 
                                }}>Complete Pickup</button>
                              );
                            } else if (!selectedCalendarBooking.returnCompleted) {
                              actions.push(
                                <button key="return" className="btn btn-success flex-1" onClick={() => { 
                                  updateBooking(selectedCalendarBooking.id, { ...selectedCalendarBooking, returnCompleted: true, status: 'completed' }); 
                                  setSelectedCalendarBooking(null); 
                                }}>Complete Return</button>
                              );
                            }
                          }
                        } else {
                          // Single trip - complete the entire booking
                          actions.push(
                            <button key="complete" className="btn btn-success flex-1" onClick={() => { 
                              updateBooking(selectedCalendarBooking.id, { ...selectedCalendarBooking, status: 'completed' }); 
                              setSelectedCalendarBooking(null); 
                            }}>Mark as Complete</button>
                          );
                        }
                      } else if (status === 'completed' && !inv) {
                        actions.push(
                          <button key="invoice" className="btn btn-warning flex-1" onClick={() => { 
                            generateInvoiceFromBooking(selectedCalendarBooking); 
                            setSelectedCalendarBooking(null); 
                          }}>Generate Invoice</button>
                        );
                      } else if (inv && (inv.status === 'pending' || inv.status === 'sent')) {
                        actions.push(
                          <button key="paid" className="btn btn-success flex-1" onClick={() => { 
                            markInvoiceAsPaid(inv.id); 
                            setSelectedCalendarBooking(null); 
                          }}>Mark as Paid</button>
                        );
                      } else if (inv && inv.status === 'paid') {
                        actions.push(<span key="paid-status" className="btn btn-disabled flex-1">Paid</span>);
                      }
                      
                      return actions;
                    })()}
                    <button className="btn btn-outline flex-1" onClick={() => setSelectedCalendarBooking(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Portal-based Booking Modal */}
      <BookingModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        editingBooking={editingBooking}
        initialDate={initialDate}
        initialTime={initialTime}
      />
    </div>
  );
}
