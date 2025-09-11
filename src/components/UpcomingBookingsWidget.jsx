// Upcoming Bookings & Mini Scheduler Widget
import { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppStore } from '../context/AppStore';
import { useResponsive } from '../hooks/useResponsive';
import { formatCurrency } from '../utils/currency';
import { CalendarIcon, TableIcon, TodayIcon, BookingIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

const localizer = momentLocalizer(moment);

// Helper function to get booking type display
const getBookingTypeDisplay = (booking) => {
  // Handle new type/source system
  if (booking.source === 'outsourced') return 'Outsourced';
  if (booking.type === 'tour') return 'Tour';
  if (booking.type === 'single') return 'Transfer';
  
  // Handle legacy types
  if (booking.type === 'priority') return 'Transfer';
  if (booking.type === 'outsourced') return 'Outsourced';
  
  return 'Transfer';
};

// Helper function to get booking type color
const getBookingTypeColor = (booking) => {
  const display = getBookingTypeDisplay(booking);
  switch (display) {
    case 'Transfer':
      return { bg: '#3b82f6', border: '#1d4ed8', badge: 'bg-blue-100 text-blue-800' };
    case 'Tour':
      return { bg: '#10b981', border: '#047857', badge: 'bg-green-100 text-green-800' };
    case 'Outsourced':
      return { bg: '#f59e0b', border: '#d97706', badge: 'bg-yellow-100 text-yellow-800' };
    default:
      return { bg: '#3b82f6', border: '#1d4ed8', badge: 'bg-blue-100 text-blue-800' };
  }
};

export default function UpcomingBookingsWidget({ defaultViewMode = 'list', showViewModeSelector = true, calendarOnly = false }) {
  const { bookings, drivers } = useAppStore();
  const { isMobile } = useResponsive();
  const [viewMode, setViewMode] = useState(defaultViewMode); // 'list', 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get upcoming bookings (today and future, confirmed only)
  const upcomingBookings = useMemo(() => {
    const today = moment().startOf('day');
    return bookings
      .filter(booking => {
        const bookingDate = moment(booking.date);
        return bookingDate.isSameOrAfter(today) && booking.status === 'confirmed';
      })
      .sort((a, b) => moment(a.date).diff(moment(b.date)));
  }, [bookings]);
  
  // Get today's bookings
  const todaysBookings = useMemo(() => {
    const today = moment().format('YYYY-MM-DD');
    return upcomingBookings.filter(booking => 
      moment(booking.date).format('YYYY-MM-DD') === today
    );
  }, [upcomingBookings]);
  
  // Convert bookings to calendar events
  const calendarEvents = useMemo(() => {
    return upcomingBookings.map(booking => {
      const startDate = moment(`${booking.date} ${booking.time || '09:00'}`).toDate();
      const endDate = moment(startDate).add(2, 'hours').toDate(); // Default 2-hour duration
      
      return {
        id: booking.id,
        title: `${booking.customer} - ${booking.pickup}`,
        start: startDate,
        end: endDate,
        resource: booking,
        style: {
          backgroundColor: getBookingTypeColor(booking).bg,
          borderColor: getBookingTypeColor(booking).border,
          color: 'white'
        }
      };
    });
  }, [upcomingBookings]);
  
  // Navigate calendar
  const navigateCalendar = (direction) => {
    const newDate = moment(selectedDate);
    switch (viewMode) {
      case 'day':
        newDate.add(direction === 'next' ? 1 : -1, 'day');
        break;
      case 'week':
        newDate.add(direction === 'next' ? 7 : -7, 'days');
        break;
      case 'month':
        newDate.add(direction === 'next' ? 1 : -1, 'month');
        break;
    }
    setSelectedDate(newDate.toDate());
  };
  
  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // View mode options
  const viewModes = [
    { id: 'list', label: 'List', icon: TableIcon },
    { id: 'day', label: 'Day', icon: CalendarIcon },
    { id: 'week', label: 'Week', icon: CalendarIcon },
    { id: 'month', label: 'Month', icon: CalendarIcon }
  ];
  
  const renderListView = () => (
    <div className="space-y-4">
      {/* Today's Bookings */}
      {todaysBookings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <TodayIcon className="w-4 h-4" />
            Today ({todaysBookings.length})
          </h4>
          <div className="space-y-2">
            {todaysBookings.map(booking => (
              <div key={booking.id} className="p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {booking.customer}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {booking.pickup} → {booking.destination}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.time} • {booking.driver || 'No driver assigned'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBookingTypeColor(booking).badge}`}>
                      {getBookingTypeDisplay(booking)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upcoming Bookings */}
      {upcomingBookings.length > todaysBookings.length && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            Upcoming ({upcomingBookings.length - todaysBookings.length})
          </h4>
          <div className="space-y-2">
            {upcomingBookings
              .filter(booking => !todaysBookings.some(tb => tb.id === booking.id))
              .slice(0, isMobile ? 3 : 5)
              .map(booking => (
                <div key={booking.id} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {booking.customer}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {moment(booking.date).format('MMM D')} • {booking.time}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {upcomingBookings.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <BookingIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No upcoming bookings</p>
        </div>
      )}
    </div>
  );
  
  const renderCalendarView = () => (
    <div style={{ height: isMobile ? '300px' : '400px' }} className="border-0">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        view={viewMode}
        date={selectedDate}
        onNavigate={setSelectedDate}
        onView={setViewMode}
        views={['day', 'week', 'month']}
        eventPropGetter={(event) => ({
          style: event.style
        })}
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture)
        }}
        popup
        messages={{
          next: 'Next',
          previous: 'Previous',
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day'
        }}
        style={{
          border: 'none'
        }}
      />
    </div>
  );
  
  return (
    <div className={calendarOnly ? "" : "card"}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {showViewModeSelector ? "Upcoming Bookings & Calendar" : (calendarOnly ? "" : "Upcoming Bookings")}
        </h3>
        
        {/* View Mode Selector */}
        {showViewModeSelector && (
          <div className="flex items-center gap-2">
            {viewMode !== 'list' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateCalendar('prev')}
                  className="p-1 rounded hover:bg-slate-100"
                  aria-label="Previous"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateCalendar('next')}
                  className="p-1 rounded hover:bg-slate-100"
                  aria-label="Next"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex bg-slate-100 rounded-lg p-1">
              {viewModes.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      viewMode === mode.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3 h-3 md:hidden" />
                    <span className="hidden md:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      {viewMode === 'list' ? renderListView() : renderCalendarView()}
      
      {/* Summary - only show if not calendar only */}
      {!calendarOnly && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Total upcoming: {upcomingBookings.length}</span>
            <span>Today: {todaysBookings.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}