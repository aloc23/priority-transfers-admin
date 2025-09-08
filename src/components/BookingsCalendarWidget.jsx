// Unified Bookings & Calendar Widget
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppStore } from '../context/AppStore';
import { useResponsive } from '../hooks/useResponsive';
import { BookingIcon, CalendarIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

const localizer = momentLocalizer(moment);

export default function BookingsCalendarWidget() {
  const { bookings, drivers, invoices, updateBooking, generateInvoiceFromBooking, markInvoiceAsPaid, refreshAllData } = useAppStore();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState(null); // 'confirmed', 'pending', 'upcoming'
  const [calendarView, setCalendarView] = useState('month');

  // Handle Book Now button click
  const handleBookNowClick = () => {
    navigate('/schedule');
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
      const bookingDate = moment(booking.date);
      return bookingDate.isSameOrAfter(today) && (booking.status === 'confirmed' || booking.status === 'pending');
    });
  }, [bookings]);

  // Filter bookings based on selected date and status
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Filter by date if selected
    if (selectedDate) {
      const selectedDateStr = moment(selectedDate).format('YYYY-MM-DD');
      filtered = filtered.filter(booking => booking.date === selectedDateStr);
    }

    // Filter by status if selected
    if (selectedStatus) {
      if (selectedStatus === 'confirmed') {
        filtered = filtered.filter(booking => booking.status === 'confirmed');
      } else if (selectedStatus === 'pending') {
        filtered = filtered.filter(booking => booking.status === 'pending');
      } else if (selectedStatus === 'upcoming') {
        const today = moment().startOf('day');
        filtered = filtered.filter(booking => {
          const bookingDate = moment(booking.date);
          return bookingDate.isSameOrAfter(today) && (booking.status === 'confirmed' || booking.status === 'pending');
        });
      }
    }

    return filtered;
  }, [bookings, selectedDate, selectedStatus]);

  // Convert bookings to calendar events
  const calendarEvents = useMemo(() => {
    return upcomingBookings.map(booking => {
      const startDate = moment(`${booking.date} ${booking.time || '09:00'}`).toDate();
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

  // Handle pill click
  const handleStatusFilter = (status) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };

  // Handle date selection from calendar
  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);
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
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header with Title and Book Now Button */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Bookings & Calendar</h2>
        <button 
          onClick={handleBookNowClick}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Book Now</span>
          <span className="sm:hidden">Book</span>
        </button>
      </div>

      {/* KPI Pills */}
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('confirmed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedStatus === 'confirmed'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Confirmed: {confirmedBookings.length}
          </button>
          <button
            onClick={() => handleStatusFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedStatus === 'pending'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            Pending: {pendingBookings.length}
          </button>
          <button
            onClick={() => handleStatusFilter('upcoming')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedStatus === 'upcoming'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Upcoming: {upcomingBookings.length}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`p-6 pt-2 ${isMobile ? 'space-y-6' : 'grid grid-cols-5 gap-6'}`}>
        {/* Calendar (Left Side) */}
        <div className={`${isMobile ? '' : 'col-span-2'} bg-slate-50 rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Calendar</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateCalendar('next')}
                className="p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div style={{ height: isMobile ? '250px' : '300px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={calendarView}
              date={selectedDate}
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
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        {/* Bookings List (Right Side) */}
        <div className={`${isMobile ? '' : 'col-span-3'} bg-slate-50 rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              {selectedStatus ? 
                `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Bookings` :
                'All Bookings'
              }
              {selectedDate && (
                <span className="text-xs text-slate-500 ml-2">
                  for {moment(selectedDate).format('MMM D, YYYY')}
                </span>
              )}
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
                      setSelectedDate(new Date());
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
                  <div key={booking.id} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-slate-900 truncate">
                            {booking.customer || booking.customerName}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1 truncate">
                          {booking.pickup} → {booking.destination}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{booking.date} • {booking.time}</span>
                          <span>Driver: {booking.driver || 'Unassigned'}</span>
                        </div>
                      </div>
                      {actions.length > 0 && (
                        <div className="flex flex-col gap-1 ml-4">
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
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}