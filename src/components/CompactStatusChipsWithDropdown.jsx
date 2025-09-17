import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const CompactStatusChipsWithDropdown = ({ 
  statusData, 
  selectedStatus, 
  onStatusClick, 
  bookings = [],
  className = "",
  chipClassName = "",
  isMobile = false,
  onBookingClick = null
}) => {
  const [expandedStatus, setExpandedStatus] = useState(null);

  const getStatusColor = (status) => {
    // Inactive states - all use lighter granite background
    return 'bg-granite-200 text-slate-700 border-granite-300 hover:bg-granite-300';
  };

  const getSelectedColor = (status) => {
    // Active states - use accent color for active status
    return 'bg-accent text-white border-accent shadow-glow';
  };

  // Filter bookings by status
  const getBookingsForStatus = (statusId) => {
    if (statusId === 'all') return bookings;
    if (statusId === 'upcoming') {
      // Show upcoming bookings (confirmed or pending in the future)
      const today = new Date().toISOString().split('T')[0];
      return bookings.filter(booking => {
        const bookingDate = booking.type === 'tour' && booking.tourStartDate 
          ? booking.tourStartDate 
          : booking.date;
        return bookingDate >= today && (booking.status === 'confirmed' || booking.status === 'pending');
      });
    }
    return bookings.filter(booking => booking.status === statusId);
  };

  const handleStatusToggle = (statusId) => {
    if (expandedStatus === statusId) {
      setExpandedStatus(null);
    } else {
      setExpandedStatus(statusId);
      onStatusClick(statusId);
    }
  };

  const formatBookingInfo = (booking) => {
    const customer = booking.customer || booking.customerName || 'Unknown Customer';
    const route = booking.type === 'tour' 
      ? `${booking.pickupLocation || 'Tour'} - ${booking.destination || 'Multiple stops'}`
      : `${booking.pickupLocation || ''} → ${booking.destination || ''}`;
    const date = booking.type === 'tour' && booking.tourStartDate 
      ? booking.tourStartDate 
      : booking.date;
    const time = booking.type === 'tour' && booking.tourStartTime
      ? booking.tourStartTime
      : booking.time;
    
    return { customer, route, date, time };
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {statusData.map((status) => {
          const isSelected = selectedStatus === status.id;
          const isExpanded = expandedStatus === status.id;
          const baseColors = isSelected ? getSelectedColor(status.label) : getStatusColor(status.label);
          const statusBookings = getBookingsForStatus(status.id);
          
          return (
            <div key={status.id} className="relative">
              <button
                onClick={() => handleStatusToggle(status.id)}
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full 
                  text-xs font-semibold border transition-all duration-200 
                  transform hover:scale-105 focus:outline-none focus:ring-2 
                  focus:ring-blue-300 focus:ring-offset-1
                  ${baseColors}
                  ${chipClassName}
                  ${isMobile ? 'min-h-[32px]' : 'min-h-[26px]'}
                  ${statusBookings.length > 0 ? 'cursor-pointer' : 'cursor-default'}
                `}
                disabled={statusBookings.length === 0}
              >
                <span className={`
                  inline-flex items-center justify-center 
                  ${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'} 
                  rounded-full text-xs font-bold
                  ${isSelected ? 'bg-white/25 text-white' : 'bg-current/20'}
                `}>
                  {status.count || 0}
                </span>
                <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium`}>
                  {status.label}
                </span>
                {statusBookings.length > 0 && (
                  <span className="ml-0.5">
                    {isExpanded ? (
                      <ChevronUpIcon className="w-3 h-3" />
                    ) : (
                      <ChevronDownIcon className="w-3 h-3" />
                    )}
                  </span>
                )}
              </button>

              {/* Dropdown with bookings */}
              {isExpanded && statusBookings.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20 animate-in slide-in-from-top-1 duration-200">
                  <div className="p-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      {status.label} Bookings ({statusBookings.length})
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {statusBookings.map((booking) => {
                        const { customer, route, date, time } = formatBookingInfo(booking);
                        return (
                          <div 
                            key={booking.id}
                            onClick={() => onBookingClick?.(booking)}
                            className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {customer}
                                </div>
                                <div className="text-xs text-gray-600 truncate">
                                  {route}
                                </div>
                                {date && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {date} {time && `at ${time}`}
                                  </div>
                                )}
                              </div>
                              {booking.price && (
                                <div className="text-xs font-semibold text-gray-700 ml-2">
                                  €{booking.price}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactStatusChipsWithDropdown;