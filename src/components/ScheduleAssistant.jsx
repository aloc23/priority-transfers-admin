// Schedule Assistant - Compact agenda view for selected calendar day
import { useState, useMemo, useContext } from 'react';
import moment from 'moment';
import { useAppStore } from '../context/AppStore';
import { BookingIcon, PlusIcon, CalendarIcon, HistoryIcon } from './Icons';
import { BookNowContext } from './BookingsCalendarWidget';

export default function ScheduleAssistant({ 
  selectedDate, 
  selectedDriver,
  onDriverChange,
  isMobile,
  className = ""
}) {
  const { bookings, drivers } = useAppStore();
  const { openModalWithDate } = useContext(BookNowContext);

  // Generate time slots for the day (every 2 hours from 6 AM to 10 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour += 2) {
      slots.push({
        time: moment().hour(hour).minute(0).format('h:00 A'),
        hour: hour,
        moment: moment().hour(hour).minute(0)
      });
    }
    return slots;
  }, []);

  // Filter bookings for selected date and driver
  const filteredBookings = useMemo(() => {
    if (!selectedDate) return [];
    
    const selectedDateStr = moment(selectedDate).format('YYYY-MM-DD');
    let filtered = bookings.filter(booking => {
      // Check if booking matches selected date
      if (booking.type === 'tour') {
        if (booking.tourStartDate && booking.tourEndDate) {
          const startDate = moment(booking.tourStartDate, 'YYYY-MM-DD');
          const endDate = moment(booking.tourEndDate, 'YYYY-MM-DD');
          const selectedMoment = moment(selectedDateStr, 'YYYY-MM-DD');
          return selectedMoment.isBetween(startDate, endDate, 'day', '[]');
        }
        return false;
      } else {
        const matchesPickupDate = booking.date === selectedDateStr;
        const matchesReturnDate = booking.hasReturn && booking.returnDate === selectedDateStr;
        return matchesPickupDate || matchesReturnDate;
      }
    });

    // Filter by driver if selected
    if (selectedDriver) {
      filtered = filtered.filter(booking => booking.driver === selectedDriver);
    }

    return filtered;
  }, [bookings, selectedDate, selectedDriver]);

  // Find bookings for each time slot
  const getBookingsForTimeSlot = (hour) => {
    return filteredBookings.filter(booking => {
      if (booking.type === 'tour') {
        // For tours, check if the time slot overlaps with tour hours
        if (booking.tourPickupTime) {
          const tourHour = moment(booking.tourPickupTime, 'HH:mm').hour();
          return Math.abs(tourHour - hour) <= 1; // Within 1 hour of slot
        }
        return hour >= 9 && hour <= 17; // Default tour hours
      } else {
        if (booking.time) {
          const bookingHour = moment(booking.time, 'HH:mm').hour();
          return Math.abs(bookingHour - hour) <= 1; // Within 1 hour of slot
        }
        return false;
      }
    });
  };

  const handleCreateBooking = (timeSlot) => {
    if (!selectedDate) return;
    
    const bookingDateTime = moment(selectedDate)
      .hour(timeSlot.hour)
      .minute(0);
    
    openModalWithDate(bookingDateTime.toDate());
  };

  const handleBookingClick = (booking) => {
    // You could implement booking details popup here
    console.log('Booking clicked:', booking);
  };

  if (!selectedDate) {
    return (
      <div className={`${className} ${isMobile ? 'p-3' : 'p-5'}`}>
        <div className="text-center py-8 text-slate-500">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">Select a date to view agenda</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-10 bg-white/95 backdrop-blur-sm ${isMobile ? 'p-3' : 'p-5'} border-b border-slate-200/50`}>
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-slate-800`}>
            Schedule Assistant
          </h3>
        </div>
        
        {/* Selected date and driver filter */}
        <div className="space-y-2">
          <div className="text-sm text-slate-600">
            {moment(selectedDate).format('MMM D, YYYY')}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            <select
              value={selectedDriver || ''}
              onChange={(e) => onDriverChange?.(e.target.value || null)}
              className="text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">All Drivers</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.name}>{driver.name}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className={`${isMobile ? 'p-3' : 'p-5'} space-y-3 max-h-96 overflow-y-auto`}>
        {timeSlots.map((slot) => {
          const slotBookings = getBookingsForTimeSlot(slot.hour);
          
          return (
            <div key={slot.hour} className="border border-slate-200 rounded-xl p-3 bg-white/50">
              {/* Time slot header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    {slot.time}
                  </span>
                </div>
                
                {/* Book button for empty slots */}
                {slotBookings.length === 0 && (
                  <button
                    onClick={() => handleCreateBooking(slot)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-3 h-3" />
                    Book
                  </button>
                )}
              </div>

              {/* Bookings or empty state */}
              {slotBookings.length === 0 ? (
                <div className="text-xs text-slate-500 italic">
                  No bookings scheduled
                </div>
              ) : (
                <div className="space-y-2">
                  {slotBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => handleBookingClick(booking)}
                      className="cursor-pointer p-2 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg hover:from-blue-50 hover:to-blue-100/50 transition-colors border border-slate-200/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-800 text-sm truncate">
                              {booking.customer}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {booking.pickup} → {booking.destination}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{booking.driver || 'Unassigned'}</span>
                            <span className="font-semibold text-slate-700">
                              €{booking.price || '45.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}