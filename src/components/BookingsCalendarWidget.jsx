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
import BookingModal from './BookingModal';
import ModernDatePicker from './ModernDatePicker';
import { BookingEventWithInvoices } from './BookingEventComponent';
import ScheduleAssistant from './ScheduleAssistant';

// Context for Book Now button (provides openModal and openModalWithDate)
export const BookNowContext = createContext({ openModal: () => {}, openModalWithDate: (date) => {} });

export function BookNowButton() {
  const { openModal } = useContext(BookNowContext);
  const { isMobile } = useResponsive();
  
  // Hide on mobile since MobileFAB already provides booking functionality
  if (isMobile) {
    return null;
  }
  
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
        <span className="text-sm font-bold tracking-wide">Book Now</span>
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

export default function BookingsCalendarWidget(props) {
  const { fullWidth = false } = props;
  const { bookings, drivers, partners, invoices, updateBooking, generateInvoiceFromBooking, markInvoiceAsPaid, refreshAllData, globalCalendarState, updateGlobalCalendarState } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  
  // Internal modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [initialDate, setInitialDate] = useState('');
  const [initialTime, setInitialTime] = useState('');
  
  // State for calendar event popup
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  
  // Use global state instead of local state with defensive defaults
  const { selectedDate, selectedStatus, selectedDriver, currentView } = globalCalendarState || {};

  // Modal management functions
  const openBookingModal = () => {
    setEditingBooking(null);
    setInitialDate('');
    setInitialTime('');
    setShowBookingModal(true);
  };

  const openBookingModalWithDate = (date) => {
    setEditingBooking(null);
    setInitialDate(moment(date).format('YYYY-MM-DD'));
    setInitialTime(moment(date).format('HH:mm'));
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setEditingBooking(null);
    setInitialDate('');
    setInitialTime('');
  };

  // Expose modal open handler globally for BookNowButton
  window.__openBookingModal = openBookingModal;
  window.__openBookingModalWithDate = openBookingModalWithDate;

  // Context value for global modal control (required by consumer)
  const bookNowContextValue = {
    openModal: openBookingModal,
    openModalWithDate: openBookingModalWithDate
  };

  // Driver color mapping for calendar events  
  const getDriverColor = (driverName, isOutsourced = false) => {
    if (isOutsourced || !driverName) {
      // Outsourced bookings use orange/amber color scheme
      return {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706'
      };
    }
    
    // Generate consistent colors for internal drivers
    const colors = [
      { backgroundColor: '#3b82f6', borderColor: '#1d4ed8' }, // Blue
      { backgroundColor: '#10b981', borderColor: '#047857' }, // Emerald  
      { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' }, // Purple
      { backgroundColor: '#f59e0b', borderColor: '#d97706' }, // Amber
      { backgroundColor: '#ef4444', borderColor: '#dc2626' }, // Red
      { backgroundColor: '#06b6d4', borderColor: '#0891b2' }, // Cyan
      { backgroundColor: '#84cc16', borderColor: '#65a30d' }, // Lime
      { backgroundColor: '#ec4899', borderColor: '#db2777' }, // Pink
    ];
    
    // Hash driver name to get consistent color
    let hash = 0;
    for (let i = 0; i < driverName.length; i++) {
      const char = driverName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };
  const handleSelectSlot = ({ start }) => {
    openBookingModalWithDate(start);
  };

  const handleSelectEvent = (event) => {
    // Set the selected calendar event for the popup
    setSelectedCalendarEvent(event.resource);
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
      if (booking.type === 'tour' && booking.tourStartDate) {
        const bookingDate = moment(booking.tourStartDate, 'YYYY-MM-DD');
        return bookingDate.isSameOrAfter(today) && (booking.status === 'confirmed' || booking.status === 'pending');
      } else if (booking.date) {
        const bookingDate = moment(booking.date, 'YYYY-MM-DD');
        return bookingDate.isSameOrAfter(today) && (booking.status === 'confirmed' || booking.status === 'pending');
      }
      return false;
    });
  }, [bookings]);

  // Single filter logic: either status OR date, not both (like Schedule tab)
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Driver filter
    if (selectedDriver) {
      filtered = filtered.filter(booking => booking.driver === selectedDriver);
    }

    // Status filter takes priority if selected
    if (selectedStatus) {
      if (selectedStatus === 'confirmed') {
        filtered = filtered.filter(booking => booking.status === 'confirmed');
      } else if (selectedStatus === 'pending') {
        filtered = filtered.filter(booking => booking.status === 'pending');
      } else if (selectedStatus === 'upcoming') {
        const today = moment().startOf('day');
        filtered = filtered.filter(booking => {
          let bookingDate;
          if (booking.type === 'tour' && booking.tourStartDate) {
            bookingDate = moment(booking.tourStartDate, 'YYYY-MM-DD');
          } else if (booking.date) {
            bookingDate = moment(booking.date, 'YYYY-MM-DD');
          } else {
            return false;
          }
          return bookingDate.isSameOrAfter(today) && booking.status === 'confirmed';
        });
      }
    } 
    // Only apply date filter if no status filter is selected
    else if (selectedDate) {
      const selectedDateStr = moment(selectedDate).format('YYYY-MM-DD');
      filtered = filtered.filter(booking => {
        if (booking.type === 'tour') {
          // Tour bookings: check if selected date falls between start and end dates
          if (booking.tourStartDate && booking.tourEndDate) {
            const startDate = moment(booking.tourStartDate, 'YYYY-MM-DD');
            const endDate = moment(booking.tourEndDate, 'YYYY-MM-DD');
            const selectedMoment = moment(selectedDateStr, 'YYYY-MM-DD');
            return selectedMoment.isBetween(startDate, endDate, 'day', '[]');
          }
          return false;
        } else {
          // Transfer bookings: check pickup date and return date if exists
          const matchesPickupDate = booking.date === selectedDateStr;
          const matchesReturnDate = booking.hasReturn && booking.returnDate === selectedDateStr;
          return matchesPickupDate || matchesReturnDate;
        }
      });
    }

    return filtered;
  }, [bookings, selectedDate, selectedStatus, selectedDriver]);

  // Convert bookings to calendar events - ONLY show confirmed bookings
  const calendarEvents = useMemo(() => {
    const events = [];
    
    // Filter to only show confirmed bookings on the calendar
    const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
    
    confirmedBookings.forEach(booking => {
      if (booking.type === 'tour') {
        // Tour bookings: render as block spanning from start to end date
        if (booking.tourStartDate && booking.tourEndDate) {
          const startDate = moment(`${booking.tourStartDate} ${booking.tourPickupTime || '09:00'}`, 'YYYY-MM-DD HH:mm').toDate();
          const endDate = moment(`${booking.tourEndDate} ${booking.tourReturnPickupTime || '17:00'}`, 'YYYY-MM-DD HH:mm').toDate();
          
          const isOutsourced = booking.source === 'outsourced' || booking.type === 'outsourced';
          const typePrefix = isOutsourced ? 'Outsourced Tour' : 'Tour';
          
          events.push({
            id: `${booking.id}-tour`,
            title: `${typePrefix}: ${booking.customer} - ${booking.pickup}`,
            start: startDate,
            end: endDate,
            resource: { ...booking, isTour: true, isOutsourced },
            style: {
              ...getDriverColor(booking.driver, isOutsourced),
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }
          });
        }
      } else {
        // Transfer bookings: render pickup leg
        if (booking.date) {
          const startDate = moment(`${booking.date} ${booking.time || '09:00'}`, 'YYYY-MM-DD HH:mm').toDate();
          const endDate = moment(startDate).add(2, 'hours').toDate();
          
          const isOutsourced = booking.source === 'outsourced' || booking.type === 'outsourced';
          const typePrefix = isOutsourced ? 'Outsourced' : 'Transfer';
          
          events.push({
            id: `${booking.id}-pickup`,
            title: `${typePrefix}: ${booking.customer} - ${booking.pickup}`,
            start: startDate,
            end: endDate,
            resource: { ...booking, isReturn: false, legType: 'pickup', isOutsourced },
            style: {
              ...getDriverColor(booking.driver, isOutsourced),
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }
          });
          
          // Return bookings: render return leg for confirmed bookings
          if (booking.hasReturn && booking.returnDate && booking.returnTime) {
            const returnStartDate = moment(`${booking.returnDate} ${booking.returnTime}`, 'YYYY-MM-DD HH:mm').toDate();
            const returnEndDate = moment(returnStartDate).add(2, 'hours').toDate();
            
            events.push({
              id: `${booking.id}-return`,
              title: `${typePrefix} Return: ${booking.customer} - ${booking.returnPickup || booking.destination}`,
              start: returnStartDate,
              end: returnEndDate,
              resource: { ...booking, isReturn: true, legType: 'return', isOutsourced },
              style: {
                ...getDriverColor(booking.driver, isOutsourced),
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                borderStyle: 'dashed',
                borderWidth: '2px'
              }
            });
          }
        }
      }
    });
    
    return events;
  }, [bookings]); // Changed from upcomingBookings to all bookings, but filtered to confirmed only

  // Handle pill click - single filter logic with global state
  const handleStatusFilter = (status) => {
    if (selectedStatus === status) {
      // Deselect if same status clicked
      updateGlobalCalendarState({ selectedStatus: null });
    } else {
      // Select new status and clear date filter
      updateGlobalCalendarState({ 
        selectedStatus: status,
        selectedDate: null
      });
    }
  };

  // Handle date selection from calendar - single filter logic with global state
  const handleCalendarDateSelect = (date) => {
    updateGlobalCalendarState({ 
      selectedDate: date,
      selectedStatus: null
    });
  };

  // Get available actions for a booking with proper pickup/return leg handling
  const getBookingActions = (booking, legType = null) => {
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
    } else if (booking.status === 'confirmed') {
      // Handle return transfer bookings with pickup/return leg differentiation
      if (booking.hasReturn) {
        if (legType === 'pickup' && !booking.pickupCompleted) {
          // Only show "Complete Pickup" for pickup leg when pickup not completed
          actions.push({
            label: 'Complete Pickup',
            onClick: async () => {
              await updateBooking(booking.id, { ...booking, pickupCompleted: true });
              refresh();
            }
          });
        } else if (legType === 'return') {
          if (booking.pickupCompleted && !booking.returnCompleted) {
            // Only show "Complete" for return leg when pickup is completed
            actions.push({
              label: 'Complete',
              onClick: async () => {
                await updateBooking(booking.id, { ...booking, returnCompleted: true, status: 'completed' });
                refresh();
              }
            });
          } else if (!booking.pickupCompleted) {
            // Show message for return leg when pickup not completed
            actions.push({
              label: 'Waiting for pickup completion',
              onClick: null, // No action - just informational
              disabled: true,
              type: 'info'
            });
          }
        } else if (!legType && !booking.pickupCompleted) {
          // Default action when no leg type specified (e.g., general booking view)
          actions.push({
            label: 'Complete Pickup',
            onClick: async () => {
              await updateBooking(booking.id, { ...booking, pickupCompleted: true });
              refresh();
            }
          });
        } else if (!legType && booking.pickupCompleted && !booking.returnCompleted) {
          actions.push({
            label: 'Complete Return',
            onClick: async () => {
              await updateBooking(booking.id, { ...booking, returnCompleted: true, status: 'completed' });
              refresh();
            }
          });
        }
      } else {
        // Single trip - complete the entire booking
        actions.push({
          label: 'Mark as Complete',
          onClick: async () => {
            await updateBooking(booking.id, { ...booking, status: 'completed' });
            refresh();
          }
        });
      }
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


        {/* Main Content Area with Enhanced Glassmorphism - Mobile optimized single-column layout */}
        <div className={`${isMobile ? 'px-4 pt-2 pb-4 space-y-4' : 'p-6 pt-4 grid grid-cols-5 gap-8'}`}>
        {/* Calendar Section with Enhanced Styling - Mobile full-width, increased height */}
        <div className={`${isMobile ? 'order-2' : 'col-span-3'} relative`}>
          <div className="bg-gradient-to-br from-white/80 via-slate-50/60 to-white/80 rounded-2xl p-5 shadow-xl border border-white/40 backdrop-blur-sm overflow-hidden">
            {/* Calendar header background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-5'}`}>
                <div className="flex items-center gap-3">
                  {/* Book Now Button - Prominent placement */}
                  <BookNowContext.Consumer>
                    {({ openModal }) => (
                      <button 
                        onClick={openModal}
                        className={`group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white ${isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50 overflow-hidden relative`}
                      >
                        {/* Animated background overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex items-center gap-1.5">
                          <PlusIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} group-hover:rotate-90 transition-transform duration-300`} />
                          <span className="font-bold tracking-wide">{isMobile ? 'Book' : 'Book Now'}</span>
                        </div>
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </div>
                      </button>
                    )}
                  </BookNowContext.Consumer>
                </div>
                
                {/* Modern unified date picker */}
                <ModernDatePicker
                  currentDate={selectedDate || new Date()}
                  onNavigate={(date) => updateGlobalCalendarState({ selectedDate: date })}
                  onToday={() => updateGlobalCalendarState({ selectedDate: new Date() })}
                  onDateSelect={(date) => handleCalendarDateSelect(date)}
                  isMobile={isMobile}
                  compact={isMobile}
                  className="flex-shrink-0"
                />
              </div>

              <div style={{ height: fullWidth ? (isMobile ? '500px' : '650px') : (isMobile ? '400px' : '550px') }} className="rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm border border-white/30 shadow-inner">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  view={currentView}
                  date={selectedDate || new Date()}
                  onNavigate={(date) => updateGlobalCalendarState({ selectedDate: date })}
                  onSelectSlot={({ start }) => handleCalendarDateSelect(start)}
                  onSelectEvent={handleSelectEvent}
                  onView={(view) => updateGlobalCalendarState({ currentView: view })}
                  views={['month']}
                  eventPropGetter={(event) => {
                    // Neon gradient backgrounds by status/type
                    let gradient = 'linear-gradient(90deg, var(--neon-blue), var(--neon-purple))';
                    if (event.resource?.isOutsourced) {
                      gradient = 'linear-gradient(90deg, var(--neon-orange), var(--neon-pink))';
                    } else if (event.resource?.legType === 'return') {
                      gradient = 'linear-gradient(90deg, var(--neon-cyan), var(--neon-blue))';
                    } else if (event.resource?.status === 'pending') {
                      gradient = 'linear-gradient(90deg, var(--neon-orange), var(--neon-yellow))';
                    }
                    return {
                      style: {
                        ...event.style,
                        background: gradient,
                        borderRadius: '12px',
                        border: 'none',
                        padding: '6px 10px',
                        margin: '2px 0',
                        fontSize: isMobile ? '11px' : '13px',
                        fontWeight: '600',
                        color: '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.12)',
                        boxShadow: '0 2px 12px rgba(139,92,246,0.10)',
                        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        outline: event.resource?.status === 'pending' ? '2px solid var(--neon-orange)' : 'none',
                      }
                    };
                  }}
                  selectable
                  popup
                  toolbar={false}
                  formats={{
                    dayFormat: (date) => moment(date).format('D'),
                    monthHeaderFormat: (date) => moment(date).format('MMMM YYYY'),
                    dayHeaderFormat: (date) => moment(date).format('dddd'),
                    dayRangeHeaderFormat: ({ start, end }) => 
                      `${moment(start).format('MMM D')} - ${moment(end).format('MMM D, YYYY')}`
                  }}
                  messages={{
                    next: "Next",
                    previous: "Previous", 
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                    agenda: "Agenda",
                    date: "Date",
                    time: "Time",
                    event: "Event",
                    noEventsInRange: "No bookings in this date range",
                    showMore: total => `+${total} more`
                  }}
                  style={{
                    fontSize: isMobile ? '12px' : '15px',
                    minHeight: isMobile ? '400px' : '550px',
                    fontFamily: 'inherit'
                  }}
                  components={{
                    event: ({ event }) => (
                      <BookingEventWithInvoices 
                        event={event} 
                        invoices={invoices} 
                        compact={false} 
                        isMobile={isMobile} 
                      />
                    ),
                    toolbar: () => null // Hide the default toolbar completely
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Assistant - Mobile full-width above calendar, reduced width on desktop */}
        <div className={`${isMobile ? 'order-1' : 'col-span-2'} relative`}>
          <div className={`bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-50/80 rounded-2xl shadow-xl border border-white/40 backdrop-blur-sm overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 via-transparent to-purple-50/10 pointer-events-none"></div>
            <div className="relative z-10">
              <ScheduleAssistant 
                selectedDate={selectedDate}
                selectedDriver={selectedDriver}
                onDriverChange={(driver) => updateGlobalCalendarState({ selectedDriver: driver })}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      </div>

        {/* Calendar Event Popup */}
        {selectedCalendarEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={() => setSelectedCalendarEvent(null)}>
            <div className="bg-white rounded-xl shadow-xl p-6 min-w-[320px] max-w-[90vw] relative" onClick={e => e.stopPropagation()}>
              {/* Status badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-slate-100`} style={{
                  background: selectedCalendarEvent.status === 'confirmed' ? '#10b981' : 
                              selectedCalendarEvent.status === 'pending' ? '#f59e0b' : '#6b7280',
                  color: 'white'
                }}>
                  {selectedCalendarEvent.status}
                </span>
                {selectedCalendarEvent.legType && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedCalendarEvent.legType === 'pickup' ? 'bg-blue-100 text-blue-800' : 'bg-cyan-100 text-cyan-800'
                  }`}>
                    {selectedCalendarEvent.legType === 'pickup' ? 'Pickup' : 'Return'} Leg
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                  {selectedCalendarEvent.customer?.[0] || 'C'}
                </div>
                <div>
                  <div className="font-semibold text-base">{selectedCalendarEvent.customer}</div>
                  <div className="text-xs text-slate-500">
                    {selectedCalendarEvent.legType === 'return' 
                      ? `${selectedCalendarEvent.returnPickup || selectedCalendarEvent.destination} → ${selectedCalendarEvent.pickup}`
                      : `${selectedCalendarEvent.pickup} → ${selectedCalendarEvent.destination}`
                    }
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 mb-2">
                <span className="font-medium">Date:</span> {
                  selectedCalendarEvent.legType === 'return' 
                    ? `${selectedCalendarEvent.returnDate} ${selectedCalendarEvent.returnTime}`
                    : `${selectedCalendarEvent.date} ${selectedCalendarEvent.time}`
                }
              </div>
              
              <div className="flex gap-2 mb-2">
                <span className="text-xs"><span className="font-medium">Driver:</span> {selectedCalendarEvent.driver || 'Unassigned'}</span>
                <span className="text-xs"><span className="font-medium">Vehicle:</span> {selectedCalendarEvent.vehicle || 'N/A'}</span>
              </div>
              
              {/* Show completion status for confirmed bookings */}
              {selectedCalendarEvent.status === 'confirmed' && selectedCalendarEvent.hasReturn && (
                <div className="flex gap-2 mb-2 text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    selectedCalendarEvent.pickupCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Pickup {selectedCalendarEvent.pickupCompleted ? '✓' : '○'}
                  </span>
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    selectedCalendarEvent.returnCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Return {selectedCalendarEvent.returnCompleted ? '✓' : '○'}
                  </span>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                {(() => {
                  const actions = getBookingActions(selectedCalendarEvent, selectedCalendarEvent.legType);
                  return actions.map((action, idx) => {
                    if (action.disabled || action.type === 'info') {
                      return (
                        <div key={idx} className="btn btn-disabled flex-1 bg-yellow-100 text-yellow-800 cursor-not-allowed text-center py-2 rounded">
                          {action.label}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={idx}
                        className="btn btn-primary flex-1"
                        onClick={() => {
                          if (action.onClick) action.onClick();
                          setSelectedCalendarEvent(null);
                        }}
                      >
                        {action.label}
                      </button>
                    );
                  });
                })()}
                <button className="btn btn-outline flex-1" onClick={() => setSelectedCalendarEvent(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* New Portal-based Booking Modal */}
        <BookingModal 
          isOpen={showBookingModal}
          onClose={closeBookingModal}
          editingBooking={editingBooking}
          initialDate={initialDate}
          initialTime={initialTime}
          title="Create New Booking"
        />
        </div>
      </div>
    </BookNowContext.Provider>
  );
}
