// Mobile-friendly booking list component for drill-down functionality
import React from 'react';
import { CustomerIcon, DriverIcon, BookingIcon, EditIcon, ViewIcon, CheckIcon } from './Icons';
import ActionMenu from './ActionMenu';
import { useResponsive } from '../hooks/useResponsive';

const StatusBadge = ({ status }) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'confirmed': 'bg-green-100 text-green-800 border-green-200',
    'completed': 'bg-blue-100 text-blue-800 border-blue-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
    'invoiced': 'bg-orange-100 text-orange-800 border-orange-200',
    'paid': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'overdue': 'bg-red-100 text-red-800 border-red-200'
  };
  
  const colorClass = statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colorClass}`}>
      {status}
    </span>
  );
};

export default function MobileBookingList({ bookings, onActionClick }) {
  const { isMobile } = useResponsive();

  const getBookingActions = (booking) => [
    {
      label: booking.status.toLowerCase() === 'pending' ? 'Confirm Booking' : 'View Details',
      icon: booking.status.toLowerCase() === 'pending' ? CheckIcon : ViewIcon,
      onClick: () => onActionClick(booking),
    },
    {
      label: 'Edit Booking',
      icon: EditIcon,
      onClick: () => console.log('Edit booking:', booking.id),
    },
    {
      label: 'Cancel Booking',
      icon: BookingIcon,
      onClick: () => console.log('Cancel booking:', booking.id),
      destructive: true,
      hidden: booking.status.toLowerCase() === 'completed' || booking.status.toLowerCase() === 'cancelled'
    }
  ];
  if (!bookings || bookings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking, index) => (
        <div 
          key={booking.id || index} 
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Header Row with Action Menu */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <CustomerIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900 text-sm truncate">
                {booking.customer || booking.customerName || 'Unknown Customer'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={booking.status || 'pending'} />
              <ActionMenu actions={getBookingActions(booking)} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {/* Date & Time */}
            <div className="flex items-center space-x-2">
              <BookingIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <span className="text-sm text-gray-600">
                  {booking.date} {booking.time && `at ${booking.time}`}
                </span>
              </div>
            </div>

            {/* Driver */}
            {booking.driver && (
              <div className="flex items-center space-x-2">
                <DriverIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {booking.driver || 'No driver assigned'}
                </span>
              </div>
            )}

            {/* Route (if available) */}
            {(booking.pickup && booking.destination) && (
              <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                <span className="font-medium">{booking.pickup}</span>
                <span className="mx-2">→</span>
                <span className="font-medium">{booking.destination}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}