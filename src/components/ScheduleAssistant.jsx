import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/AppStore';
import { useResponsive } from '../hooks/useResponsive';
import { formatCurrency } from '../utils/currency';
import { PlusIcon, CalendarIcon, HistoryIcon } from './Icons';
import moment from 'moment';

export default function ScheduleAssistant({ 
  selectedDate, 
  selectedDriver, 
  onCreateBooking,
  onBookingClick 
}) {
  const { bookings, drivers } = useAppStore();
  const { isMobile } = useResponsive();
  const [filterDriver, setFilterDriver] = useState(selectedDriver || '');

  // Get bookings for the selected date
  const dayBookings = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateStr = moment(selectedDate).format('YYYY-MM-DD');
    let filtered = bookings.filter(booking => {
      const bookingDate = moment(booking.date).format('YYYY-MM-DD');
      return bookingDate === dateStr;
    });

    // Apply driver filter
    if (filterDriver) {
      filtered = filtered.filter(booking => booking.driver === filterDriver);
    }

    // Sort by time
    return filtered.sort((a, b) => {
      const timeA = moment(a.time, 'HH:mm');
      const timeB = moment(b.time, 'HH:mm');
      return timeA.diff(timeB);
    });
  }, [bookings, selectedDate, filterDriver]);

  // Generate time slots for the day (every 2 hours from 6 AM to 10 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour += 2) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const hasBooking = dayBookings.some(booking => {
        const bookingHour = parseInt(booking.time.split(':')[0]);
        return Math.abs(bookingHour - hour) < 2;
      });
      
      slots.push({
        time: timeStr,
        displayTime: moment(timeStr, 'HH:mm').format('h:mm A'),
        hasBooking,
        bookings: dayBookings.filter(booking => {
          const bookingHour = parseInt(booking.time.split(':')[0]);
          return Math.abs(bookingHour - hour) < 2;
        })
      });
    }
    return slots;
  }, [dayBookings]);

  const handleCreateBookingForTime = (timeStr) => {
    if (onCreateBooking) {
      onCreateBooking(selectedDate, timeStr);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 rounded-t-xl px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Schedule Assistant
          </h3>
          <span className="text-xs text-slate-500">
            {selectedDate ? moment(selectedDate).format('MMM D, YYYY') : 'No date selected'}
          </span>
        </div>
        
        {/* Driver Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Filter:</label>
          <select
            value={filterDriver}
            onChange={(e) => setFilterDriver(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Drivers</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.name}>{driver.name}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500 ml-auto">
            {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Agenda Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {!selectedDate ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="text-center">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a date to view agenda</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <div key={slot.time} className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
                    <HistoryIcon className="w-3 h-3" />
                    {slot.displayTime}
                  </div>
                  {!slot.hasBooking && (
                    <button
                      onClick={() => handleCreateBookingForTime(slot.time)}
                      className="ml-auto text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Book
                    </button>
                  )}
                </div>
                
                {slot.hasBooking ? (
                  <div className="space-y-2">
                    {slot.bookings.map((booking) => (
                      <div 
                        key={booking.id}
                        onClick={() => onBookingClick && onBookingClick(booking)}
                        className="bg-slate-50 rounded-md p-2 border border-slate-200 cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium text-sm text-slate-900 truncate">
                            {booking.customer}
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mb-1">
                          {booking.pickup} → {booking.destination}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{booking.driver}</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(booking.price || 45)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    No bookings scheduled
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}