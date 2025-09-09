// Unified Bookings & Calendar Widget
import { useState, useMemo, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppStore } from '../context/AppStore';
import { useFleet } from '../context/FleetContext';
import { useResponsive } from '../hooks/useResponsive';
import { BookingIcon, CalendarIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

// Context for Book Now button (provides openModal and openModalWithDate)
export const BookNowContext = createContext({ openModal: () => {}, openModalWithDate: (date) => {} });

export function BookNowButton() {
  const { openModal } = useContext(BookNowContext);
  return (
    <button 
      onClick={openModal}
      className="btn btn-primary flex items-center gap-2"
    >
      <PlusIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Book Now</span>
      <span className="sm:hidden">Book</span>
    </button>
  );
}

BookingsCalendarWidget.BookNowButton = BookNowButton;
BookingsCalendarWidget.BookNowContext = BookNowContext;

const localizer = momentLocalizer(moment);

export default function BookingsCalendarWidget({ showBookingModal, setShowBookingModal, bookingForm, setBookingForm, ...props }) {
  const { bookings, drivers, invoices, updateBooking, generateInvoiceFromBooking, markInvoiceAsPaid, refreshAllData, addBooking } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  // State management
  const [selectedDate, setSelectedDate] = useState(null); // Start with no date selected
  const [selectedStatus, setSelectedStatus] = useState(null); // 'confirmed', 'pending', 'upcoming'
  const [calendarView, setCalendarView] = useState('month');

  // Handle Book Now button click - open form directly instead of navigating

  // Expose modal open handler globally for BookNowButton
  window.__openBookingModal = () => setShowBookingModal(true);

  // Helper to open modal with a specific date
  const openBookingModalWithDate = (date) => {
    setBookingForm((form) => ({ ...form, date: moment(date).format('YYYY-MM-DD') }));
    setShowBookingModal(true);
  };

  // Context value for global modal control (required by consumer)
  const bookNowContextValue = {
    openModal: () => setShowBookingModal(true),
    openModalWithDate: (date) => {
      setBookingForm((form) => ({ ...form, date: moment(date).format('YYYY-MM-DD') }));
      setShowBookingModal(true);
    }
  };

  // Handle booking form submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    addBooking(bookingForm);
    setShowBookingModal(false);
    // Reset form
    setBookingForm({
      customer: '',
      pickup: '',
      destination: '',
      date: moment().format('YYYY-MM-DD'),
      time: '09:00',
      driver: '',
      vehicleId: '',
      status: 'pending',
      type: 'priority',
      price: 45
    });
  };

  // Combine booking and invoice status like in Dashboard.jsx
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

  // Calculate KPIs
  const confirmedBookings = useMemo(() => 
    bookings.filter(booking => booking.status === 'confirmed'), [bookings]
  );

  const pendingBookings = useMemo(() => 
    bookings.filter(booking => booking.status === 'pending'), [bookings]
  );

  const upcomingBookings = useMemo(() => {
    const today = moment().startOf('day');
    return bookings.filter(booking => {
      const bookingDate = moment(booking.date, 'YYYY-MM-DD');
      return bookingDate.isSameOrAfter(today) && (booking.status === 'confirmed' || booking.status === 'pending');
    });
  }, [bookings]);

  // Single filter logic: either status OR date, not both (like Schedule tab)
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Status filter takes priority if selected
    if (selectedStatus) {
      if (selectedStatus === 'confirmed') {
        filtered = filtered.filter(booking => booking.status === 'confirmed');
      } else if (selectedStatus === 'pending') {
        filtered = filtered.filter(booking => booking.status === 'pending');
      } else if (selectedStatus === 'upcoming') {
        const today = moment().startOf('day');
        filtered = filtered.filter(booking => {
          const bookingDate = moment(booking.date, 'YYYY-MM-DD');
          return bookingDate.isSameOrAfter(today) && booking.status === 'confirmed';
        });
      }
    } 
    // Only apply date filter if no status filter is selected
    else if (selectedDate) {
      const selectedDateStr = moment(selectedDate).format('YYYY-MM-DD');
      filtered = filtered.filter(booking => booking.date === selectedDateStr);
    }

    return filtered;
  }, [bookings, selectedDate, selectedStatus]);

  // Convert bookings to calendar events
  const calendarEvents = useMemo(() => {
    return upcomingBookings.map(booking => {
      // Use ISO format for date and time
      const startDate = moment(`${booking.date} ${booking.time || '09:00'}`, 'YYYY-MM-DD HH:mm').toDate();
      const endDate = moment(startDate).add(2, 'hours').toDate();
      
      return {
        id: booking.id,
        title: `${booking.customer} - ${booking.pickup}`,
        start: startDate,
        end: endDate,
        resource: booking,
        style: {
          backgroundColor: booking.status === 'confirmed' ? '#10b981' : '#f59e0b',
          borderColor: booking.status === 'confirmed' ? '#059669' : '#d97706',
          color: 'white'
        }
      };
    });
  }, [upcomingBookings]);

  // Handle pill click - single filter logic
  const handleStatusFilter = (status) => {
    if (selectedStatus === status) {
      // Deselect if same status clicked
      setSelectedStatus(null);
    } else {
      // Select new status and clear date filter
      setSelectedStatus(status);
      setSelectedDate(null);
    }
  };

  // Handle date selection from calendar - single filter logic
  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedStatus(null);
  };

  // Navigate calendar
  const navigateCalendar = (direction) => {
    const newDate = moment(selectedDate);
    newDate.add(direction === 'next' ? 1 : -1, 'month');
    setSelectedDate(newDate.toDate());
  };

  // Get available actions for a booking
  const getBookingActions = (booking) => {
    const inv = invoices.find(inv => inv.bookingId === booking.id);
    const actions = [];
    
    const refresh = () => {
      if (typeof refreshAllData === 'function') refreshAllData();
    };

    if (booking.status === 'pending') {
      actions.push({ 
        label: 'Confirm', 
        onClick: async () => { 
          await updateBooking(booking.id, { ...booking, status: 'confirmed' }); 
          refresh(); 
        } 
      });
    }
    if (booking.status === 'confirmed') {
      actions.push({ 
        label: 'Complete', 
        onClick: async () => { 
          await updateBooking(booking.id, { ...booking, status: 'completed' }); 
          refresh(); 
        } 
      });
    }
    if (booking.status === 'completed' && !inv) {
      actions.push({ 
        label: 'Generate Invoice', 
        onClick: async () => { 
          await generateInvoiceFromBooking(booking); 
          refresh(); 
        } 
      });
    }
    if (inv && (inv.status === 'pending' || inv.status === 'sent')) {
      actions.push({ 
        label: 'Mark as Paid', 
        onClick: async () => { 
          await markInvoiceAsPaid(inv.id); 
          refresh(); 
        } 
      });
  }
  return actions;
  };

  return (
    <BookNowContext.Provider value={bookNowContextValue}>
      
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* KPI Pills */}
        <div className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('confirmed')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-green-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 ${
              selectedStatus === 'confirmed'
                ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg scale-105'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
            style={{ letterSpacing: '0.01em' }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 align-middle"></span>
            Confirmed: {confirmedBookings.length}
          </button>
          <button
            onClick={() => handleStatusFilter('pending')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-amber-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 ${
              selectedStatus === 'pending'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-white shadow-lg scale-105'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
            style={{ letterSpacing: '0.01em' }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2 align-middle"></span>
            Pending: {pendingBookings.length}
          </button>
          <button
            onClick={() => handleStatusFilter('upcoming')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-blue-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 ${
              selectedStatus === 'upcoming'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg scale-105'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
            style={{ letterSpacing: '0.01em' }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2 align-middle"></span>
            Upcoming: {upcomingBookings.length}
          </button>
        </div>
      </div>

        {/* Main Content Area */}
        <div className={`p-6 pt-2 ${isMobile ? 'space-y-6' : 'grid grid-cols-5 gap-6'}`}>
        {/* Calendar (Left Side) */}
        <div className={`${isMobile ? '' : 'col-span-2'} bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 shadow-md border border-slate-100`}> 
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Calendar</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Previous Month"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Today"
              >
                Today
              </button>
              <button
                onClick={() => navigateCalendar('next')}
                className="p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Next Month"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div style={{ height: isMobile ? '350px' : '450px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={calendarView}
              date={selectedDate || new Date()}
              onNavigate={setSelectedDate}
              onSelectSlot={({ start }) => handleCalendarDateSelect(start)}
              onView={setCalendarView}
              views={['month']}
              eventPropGetter={(event) => ({
                style: event.style
              })}
              selectable
              popup
              style={{
                fontSize: isMobile ? '13px' : '15px',
                minHeight: isMobile ? '350px' : '450px'
              }}
            />
          </div>
        </div>

        {/* Bookings List (Right Side) */}
        <div className={`${isMobile ? '' : 'col-span-3'} bg-slate-50 rounded-xl p-4`}>
          {/* Show create booking for selected date */}
          {selectedDate && !selectedStatus && (
            <BookNowContext.Consumer>
              {({ openModalWithDate }) => (
                <div className="mb-2 flex items-center gap-2">
                  <button
                    className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                    onClick={() => openModalWithDate(selectedDate)}
                  >
                    + Create booking for {moment(selectedDate).format('MMM D, YYYY')}
                  </button>
                </div>
              )}
            </BookNowContext.Consumer>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              {selectedStatus ? 
                `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Bookings` :
                selectedDate ?
                  `All Bookings for ${moment(selectedDate).format('MMM D, YYYY')}` :
                  'All Bookings'
              }
            </h3>
            <div className="text-xs text-slate-500">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookingIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bookings found</p>
                {selectedStatus || selectedDate ? (
                  <button
                    onClick={() => {
                      setSelectedStatus(null);
                      setSelectedDate(null);
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const actions = getBookingActions(booking);
                const status = getCombinedStatus(booking);
                return (
                  <details key={booking.id} className="bg-white border border-slate-200 rounded-lg p-3 group">
                    <summary className="flex items-center justify-between cursor-pointer select-none">
                      <span className="font-medium text-slate-800 truncate">{booking.customer || booking.customerName}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {status}
                      </span>
                    </summary>
                    <div className="mt-2 text-xs text-slate-500">
                      <div><strong>Route:</strong> {booking.pickup} → {booking.destination}</div>
                      <div><strong>Date:</strong> {booking.date} • {booking.time}</div>
                      <div><strong>Driver:</strong> {booking.driver || 'Unassigned'}</div>
                    </div>
                    {actions.length > 0 && (
                      <div className="flex flex-col gap-1 mt-2">
                        {actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={action.onClick}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </details>
                );
              })
            )}
          </div>
        </div>
      </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Booking</h2>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingForm.customer}
                      onChange={(e) => setBookingForm({ ...bookingForm, customer: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingForm.pickup}
                      onChange={(e) => setBookingForm({ ...bookingForm, pickup: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingForm.destination}
                      onChange={(e) => setBookingForm({ ...bookingForm, destination: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingForm.driver}
                      onChange={(e) => setBookingForm({ ...bookingForm, driver: e.target.value })}
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.name}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingForm.price}
                      onChange={(e) => setBookingForm({ ...bookingForm, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Create Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </BookNowContext.Provider>
  );
}