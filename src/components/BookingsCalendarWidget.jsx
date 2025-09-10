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
  <div className="fixed inset-0 bg-white/40 backdrop-blur-xl flex justify-center overflow-y-auto p-6 z-50">
    <div className="modal-container w-full max-w-3xl my-8 bg-white rounded-xl shadow-2xl flex flex-col">
      
      {/* Simplified Header */}
      <div className="modal-header flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Create New Booking
        </h2>
        <button
          type="button"
          onClick={() => setShowBookingModal(false)}
          className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      {/* Scrollable Body */}
      <div className="modal-body flex-1 overflow-y-auto p-6">
        <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-6">
          
          {/* Booking Type Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              Booking Type
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingForm({ ...bookingForm, bookingType: 'internal' })}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  bookingForm.bookingType === 'internal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    bookingForm.bookingType === 'internal' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="font-medium text-slate-800">Internal</div>
                    <div className="text-xs text-slate-600">Use company fleet</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setBookingForm({ ...bookingForm, bookingType: 'outsourced' })}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  bookingForm.bookingType === 'outsourced'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    bookingForm.bookingType === 'outsourced' ? 'bg-purple-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="font-medium text-slate-800">Outsourced</div>
                    <div className="text-xs text-slate-600">External partner</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Trip Type Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              Trip Type
            </h3>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setBookingForm({ ...bookingForm, tripType: 'single', returnTrip: false })}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition ${
                  bookingForm.tripType === 'single'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Transfer
              </button>
              <button
                type="button"
                onClick={() => setBookingForm({ ...bookingForm, tripType: 'tour', returnTrip: false })}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition ${
                  bookingForm.tripType === 'tour'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Tour
              </button>
            </div>
          </div>

          {/* Return Trip Option for Transfers */}
          {bookingForm.tripType === 'single' && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
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
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="font-medium text-amber-800">Add return trip</span>
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
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              Booking Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Customer, Pickup, Destination, Dates, Times ... */}
              {/* 🔹 Keep your full Booking Details block here */}
            </div>
          </div>

          {/* Partner Selection for Outsourced OR Internal Assignment */}
          {bookingForm.bookingType === 'outsourced' ? (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Partner Assignment
              </h3>
              {/* Partner dropdown ... */}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Internal Assignment
              </h3>
              {/* Driver + Vehicle dropdowns ... */}
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Pricing
            </h3>
            {/* Price input ... */}
          </div>
        </form>
      </div>
      
      {/* Sticky Footer */}
      <div className="modal-footer flex justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => setShowBookingModal(false)}
          className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors font-medium rounded-lg hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="booking-form"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          Create Booking
        </button>
      </div>
    </div>
    </div>
  </BookNowContext.Provider>
);
