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
      className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50 overflow-hidden"
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="hidden sm:inline text-sm font-bold tracking-wide">Book Now</span>
        <span className="sm:hidden text-sm font-bold">Book</span>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      </div>
    </button>
  );
}

BookingsCalendarWidget.BookNowButton = BookNowButton;
BookingsCalendarWidget.BookNowContext = BookNowContext;

const localizer = momentLocalizer(moment);

export default function BookingsCalendarWidget({ showBookingModal, setShowBookingModal, bookingForm, setBookingForm, ...props }) {
  const { bookings, drivers, partners, invoices, updateBooking, generateInvoiceFromBooking, markInvoiceAsPaid, refreshAllData, addBooking } = useAppStore();
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
      price: 45,
      // Reset new enhanced fields
      bookingType: 'internal',
      tripType: 'single',
      returnTrip: false,
      returnPickup: '',
      returnDestination: '',
      returnDate: '',
      returnTime: '',
      partnerId: ''
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
      
      <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden backdrop-blur-sm relative">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20 pointer-events-none"></div>
        <div className="relative z-10">
        {/* Enhanced KPI Pills with glassmorphism */}
        <div className="px-6 py-5 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-white/30">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusFilter('confirmed')}
            className={`group px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 ${
              selectedStatus === 'confirmed'
                ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-white shadow-emerald-500/30 border-emerald-300/50 scale-105'
                : 'bg-gradient-to-r from-green-50/90 to-emerald-50/90 text-emerald-700 hover:from-green-100 hover:to-emerald-100 border-emerald-200/60 backdrop-blur-sm'
            }`}
            style={{ letterSpacing: '0.02em' }}
          >
            <span className="inline-flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedStatus === 'confirmed' ? 'bg-white/90' : 'bg-emerald-500'} animate-pulse`}></span>
              <span className="font-bold">Confirmed:</span> {confirmedBookings.length}
            </span>
          </button>
          <button
            onClick={() => handleStatusFilter('pending')}
            className={`group px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 ${
              selectedStatus === 'pending'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-white shadow-amber-500/30 border-amber-300/50 scale-105'
                : 'bg-gradient-to-r from-amber-50/90 to-yellow-50/90 text-amber-700 hover:from-amber-100 hover:to-yellow-100 border-amber-200/60 backdrop-blur-sm'
            }`}
            style={{ letterSpacing: '0.02em' }}
          >
            <span className="inline-flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedStatus === 'pending' ? 'bg-white/90' : 'bg-amber-500'} animate-pulse`}></span>
              <span className="font-bold">Pending:</span> {pendingBookings.length}
            </span>
          </button>
          <button
            onClick={() => handleStatusFilter('upcoming')}
            className={`group px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 ${
              selectedStatus === 'upcoming'
                ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 text-white shadow-blue-500/30 border-blue-300/50 scale-105'
                : 'bg-gradient-to-r from-blue-50/90 to-cyan-50/90 text-blue-700 hover:from-blue-100 hover:to-cyan-100 border-blue-200/60 backdrop-blur-sm'
            }`}
            style={{ letterSpacing: '0.02em' }}
          >
            <span className="inline-flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedStatus === 'upcoming' ? 'bg-white/90' : 'bg-blue-500'} animate-pulse`}></span>
              <span className="font-bold">Upcoming:</span> {upcomingBookings.length}
            </span>
          </button>
        </div>
      </div>

        {/* Main Content Area with Enhanced Glassmorphism */}
        <div className={`p-6 pt-4 ${isMobile ? 'space-y-8' : 'grid grid-cols-5 gap-8'}`}>
        {/* Calendar Section (Left Side) with Enhanced Styling */}
        <div className={`${isMobile ? '' : 'col-span-2'} relative`}>
          <div className="bg-gradient-to-br from-white/80 via-slate-50/60 to-white/80 rounded-2xl p-5 shadow-xl border border-white/40 backdrop-blur-sm overflow-hidden">
            {/* Calendar header background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 bg-gradient-to-r from-slate-600 to-slate-500 bg-clip-text">Calendar</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateCalendar('prev')}
                    className="p-2 rounded-xl hover:bg-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-md transform hover:scale-105"
                    aria-label="Previous Month"
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3 py-2 text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                    aria-label="Today"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateCalendar('next')}
                    className="p-2 rounded-xl hover:bg-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-md transform hover:scale-105"
                    aria-label="Next Month"
                  >
                    <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div style={{ height: isMobile ? '350px' : '450px' }} className="rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm border border-white/30 shadow-inner">
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
          </div>
        </div>

        {/* Bookings List (Right Side) with Enhanced Design */}
        <div className={`${isMobile ? '' : 'col-span-3'} relative`}>
          <div className="bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-50/80 rounded-2xl p-5 shadow-xl border border-white/40 backdrop-blur-sm overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 via-transparent to-purple-50/10 pointer-events-none"></div>
            <div className="relative z-10">
              {/* Show create booking for selected date */}
              {selectedDate && !selectedStatus && (
                <BookNowContext.Consumer>
                  {({ openModalWithDate }) => (
                    <div className="mb-4 flex items-center gap-3">
                      <button
                        className="group inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-100 hover:to-indigo-100 px-4 py-2.5 rounded-xl border border-blue-200/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300/50 shadow-sm hover:shadow-md"
                        onClick={() => openModalWithDate(selectedDate)}
                      >
                        <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium">Create booking for {moment(selectedDate).format('MMM D, YYYY')}</span>
                      </button>
                    </div>
                  )}
                </BookNowContext.Consumer>
              )}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
                  {selectedStatus ? 
                    `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Bookings` :
                    selectedDate ?
                      `All Bookings for ${moment(selectedDate).format('MMM D, YYYY')}` :
                      'All Bookings'
                  }
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-100/80 to-slate-50/80 rounded-full text-xs font-bold text-slate-600 border border-slate-200/50 backdrop-blur-sm shadow-sm">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                  {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="mb-4 p-4 mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                      <BookingIcon className="w-8 h-8 opacity-50 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-2">No bookings found</p>
                    <p className="text-xs text-slate-500">Create your first booking to get started</p>
                    {selectedStatus || selectedDate ? (
                      <button
                        onClick={() => {
                          setSelectedStatus(null);
                          setSelectedDate(null);
                        }}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300/50 rounded-md px-2 py-1 transition-colors duration-200"
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
                      <details key={booking.id} className="group bg-gradient-to-r from-white/90 to-slate-50/90 border border-slate-200/60 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-indigo-50/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <summary className="relative z-10 flex items-center justify-between cursor-pointer select-none">
                          <span className="font-bold text-slate-800 truncate text-base">{booking.customer || booking.customerName}</span>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ml-3 shadow-sm transition-all duration-300 ${
                            booking.status === 'confirmed' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200/50' :
                            booking.status === 'pending' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200/50' :
                            'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-800 border border-slate-200/50'
                          }`}>
                            {status}
                          </span>
                        </summary>
                        <div className="relative z-10 mt-3 text-sm text-slate-600 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">Route:</span> 
                            <span className="bg-slate-100/80 px-2 py-1 rounded-lg text-xs font-medium">{booking.pickup}</span>
                            <span className="text-slate-400">→</span>
                            <span className="bg-slate-100/80 px-2 py-1 rounded-lg text-xs font-medium">{booking.destination}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div><span className="font-semibold text-slate-700">Date:</span> {booking.date}</div>
                            <div><span className="font-semibold text-slate-700">Time:</span> {booking.time}</div>
                          </div>
                          <div className="text-xs"><span className="font-semibold text-slate-700">Driver:</span> {booking.driver || 'Unassigned'}</div>
                        </div>
                        {actions.length > 0 && (
                          <div className="relative z-10 flex flex-wrap gap-2 mt-4">
                            {actions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={action.onClick}
                                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-100/80 to-indigo-100/80 text-blue-800 hover:from-blue-200 hover:to-indigo-200 rounded-lg border border-blue-200/50 backdrop-blur-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300/50 shadow-sm hover:shadow-md"
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
        </div>
      </div>

        {/* Enhanced Booking Modal with Improved Layout */}
        {showBookingModal && (
          <div className="modal-backdrop">
            <div className="modal-container">
              {/* Sticky Header */}
              <div className="modal-header bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <PlusIcon className="w-6 h-6" />
                  Create New Booking
                </h2>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="btn-close text-white hover:text-blue-100 hover:bg-white/10"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              {/* Header Subtitle */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 pb-4">
                <p className="text-blue-100 text-sm">Fill in the details for your new booking</p>
              </div>
              
              {/* Scrollable Body */}
              <div className="modal-body">
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {/* Booking Type Selection */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Booking Type
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, bookingType: 'internal' })}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                          bookingForm.bookingType === 'internal'
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            bookingForm.bookingType === 'internal' ? 'border-blue-500' : 'border-slate-300'
                          }`}>
                            {bookingForm.bookingType === 'internal' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">Internal</div>
                            <div className="text-xs text-slate-600">Use company fleet & drivers</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, bookingType: 'outsourced' })}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                          bookingForm.bookingType === 'outsourced'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            bookingForm.bookingType === 'outsourced' ? 'border-purple-500' : 'border-slate-300'
                          }`}>
                            {bookingForm.bookingType === 'outsourced' && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">Outsourced</div>
                            <div className="text-xs text-slate-600">Assign to external partner</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Trip Type Selection */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Trip Type
                    </h3>
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, tripType: 'single', returnTrip: false })}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          bookingForm.tripType === 'single'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Transfer
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, tripType: 'tour' })}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          bookingForm.tripType === 'tour'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Tour
                      </button>
                    </div>
                  </div>

                  {/* Return Trip Option for Tours */}
                  {bookingForm.tripType === 'tour' && (
                    <div className="space-y-4 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bookingForm.returnTrip}
                          onChange={(e) => {
                            const returnTrip = e.target.checked;
                            setBookingForm({ 
                              ...bookingForm, 
                              returnTrip,
                              returnPickup: returnTrip ? bookingForm.destination : '',
                              returnDestination: returnTrip ? bookingForm.pickup : ''
                            });
                          }}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 focus:ring-offset-2"
                        />
                        <span className="font-semibold text-amber-800">Add return trip</span>
                      </label>
                      {bookingForm.returnTrip && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-amber-200">
                          <h4 className="font-medium text-amber-800">Return Trip Details</h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-amber-700 mb-1">Return Pickup</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/80"
                                value={bookingForm.returnPickup}
                                onChange={(e) => setBookingForm({ ...bookingForm, returnPickup: e.target.value })}
                                placeholder="Auto-filled from destination"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-amber-700 mb-1">Return Destination</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/80"
                                value={bookingForm.returnDestination}
                                onChange={(e) => setBookingForm({ ...bookingForm, returnDestination: e.target.value })}
                                placeholder="Auto-filled from pickup"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-amber-700 mb-1">Return Date</label>
                                <input
                                  type="date"
                                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/80"
                                  value={bookingForm.returnDate}
                                  onChange={(e) => setBookingForm({ ...bookingForm, returnDate: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-amber-700 mb-1">Return Time</label>
                                <input
                                  type="time"
                                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/80"
                                  value={bookingForm.returnTime}
                                  onChange={(e) => setBookingForm({ ...bookingForm, returnTime: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Basic Booking Information */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      Booking Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Customer</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={bookingForm.customer}
                          onChange={(e) => setBookingForm({ ...bookingForm, customer: e.target.value })}
                          placeholder="Enter customer name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Location</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={bookingForm.pickup}
                            onChange={(e) => {
                              const pickup = e.target.value;
                              setBookingForm({ 
                                ...bookingForm, 
                                pickup,
                                returnDestination: bookingForm.returnTrip ? pickup : bookingForm.returnDestination
                              });
                            }}
                            placeholder="Enter pickup address"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Destination</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={bookingForm.destination}
                            onChange={(e) => {
                              const destination = e.target.value;
                              setBookingForm({ 
                                ...bookingForm, 
                                destination,
                                returnPickup: bookingForm.returnTrip ? destination : bookingForm.returnPickup
                              });
                            }}
                            placeholder="Enter destination address"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {bookingForm.tripType === 'tour' ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Tour Start Date</label>
                              <input
                                type="date"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={bookingForm.date}
                                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Tour End Date</label>
                              <input
                                type="date"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={bookingForm.tourEndDate || ''}
                                onChange={(e) => setBookingForm({ ...bookingForm, tourEndDate: e.target.value })}
                                required
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Date</label>
                              <input
                                type="date"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={bookingForm.date}
                                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                              <input
                                type="time"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={bookingForm.time}
                                onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                                required
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Partner Selection for Outsourced Bookings */}
                  {bookingForm.bookingType === 'outsourced' ? (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Partner Assignment
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Partner</label>
                        <select
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          value={bookingForm.partnerId}
                          onChange={(e) => setBookingForm({ ...bookingForm, partnerId: e.target.value })}
                          required
                        >
                          <option value="">Choose a partner...</option>
                          {partners.map((partner) => (
                            <option key={partner.id} value={partner.id}>
                              {partner.name} - {partner.contact}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    /* Internal Driver & Vehicle Selection */
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Internal Assignment
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Driver</label>
                          <select
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            value={bookingForm.driver}
                            onChange={(e) => setBookingForm({ ...bookingForm, driver: e.target.value })}
                          >
                            <option value="">Select Driver (Optional)</option>
                            {drivers.map((driver) => (
                              <option key={driver.id} value={driver.name}>
                                {driver.name} - {driver.status}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle</label>
                          <select
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            value={bookingForm.vehicle || ''}
                            onChange={(e) => setBookingForm({ ...bookingForm, vehicle: e.target.value })}
                          >
                            <option value="">Select Vehicle (Optional)</option>
                            {fleet.map((vehicle) => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.name} - {vehicle.type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Pricing
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Price (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        value={bookingForm.price}
                        onChange={(e) => setBookingForm({ ...bookingForm, price: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Sticky Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors font-medium rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookingSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Create Booking
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </BookNowContext.Provider>
  );
}