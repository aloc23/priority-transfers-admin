import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import { BookingIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

export default function BookingStatusBlock({ 
  compact = false, 
  showAddButtons = false, 
  showBookingList = false,
  onStatusFilter = null,
  hideCombinedStatus = false // New prop to hide combined status section
}) {
  const { bookings, invoices, updateBooking, confirmBooking, markBookingCompleted, deleteBooking } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [expandedKPI, setExpandedKPI] = useState(null);
  // For closing dropdown on outside click or Escape
  const dropdownRef = useRef();

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (expandedKPI === null) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExpandedKPI(null);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setExpandedKPI(null);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [expandedKPI]);

  // Calculate booking status counts
  const bookingStatusCounts = useMemo(() => {
    const counts = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    bookings.forEach(booking => {
      if (counts[booking.status] !== undefined) {
        counts[booking.status]++;
      }
    });

    return counts;
  }, [bookings]);

  // Combined booking/invoice status logic
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

  const combinedStatusCounts = useMemo(() => {
    const counts = {
      'Pending': 0,
      'Confirmed': 0,
      'Completed': 0,
      'Invoiced': 0,
      'Paid': 0,
      'Overdue': 0,
      'Cancelled': 0,
      'Other': 0
    };

    bookings.forEach(booking => {
      const status = getCombinedStatus(booking);
      counts[status]++;
    });

    return counts;
  }, [bookings, invoices]);

  // Status configuration
  const statusConfig = [
    { 
      id: 'all', 
      label: 'All Bookings', 
      count: bookingStatusCounts.all, 
      color: 'bg-slate-600 text-white hover:bg-slate-700',
      activeColor: 'bg-slate-600 text-white shadow-lg'
    },
    { 
      id: 'pending', 
      label: 'Pending', 
      count: bookingStatusCounts.pending, 
      color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      activeColor: 'bg-amber-600 text-white shadow-lg'
    },
    { 
      id: 'confirmed', 
      label: 'Confirmed', 
      count: bookingStatusCounts.confirmed, 
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      activeColor: 'bg-green-600 text-white shadow-lg'
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      count: bookingStatusCounts.completed, 
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      activeColor: 'bg-blue-600 text-white shadow-lg'
    },
    { 
      id: 'cancelled', 
      label: 'Cancelled', 
      count: bookingStatusCounts.cancelled, 
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      activeColor: 'bg-gray-600 text-white shadow-lg'
    }
  ];

  // Combined status KPIs configuration
  const combinedStatusConfig = [
    { 
      id: 'Invoiced', 
      label: 'Invoiced', 
      count: combinedStatusCounts.Invoiced, 
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      activeColor: 'bg-orange-600 text-white shadow-lg',
      description: 'Bookings that have been completed and invoiced but not yet paid'
    },
    { 
      id: 'Paid', 
      label: 'Paid', 
      count: combinedStatusCounts.Paid, 
      color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
      activeColor: 'bg-emerald-600 text-white shadow-lg',
      description: 'Bookings that have been completed, invoiced, and payment has been received'
    },
    { 
      id: 'Overdue', 
      label: 'Overdue', 
      count: combinedStatusCounts.Overdue, 
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      activeColor: 'bg-red-600 text-white shadow-lg',
      description: 'Bookings with overdue invoices that require immediate attention'
    }
  ];

  // Handle status filter
  const handleStatusClick = (statusId) => {
    const newStatus = selectedStatus === statusId ? null : statusId;
    setSelectedStatus(newStatus);
    if (onStatusFilter) {
      onStatusFilter(newStatus);
    }
  };

  // Handle KPI expansion
  const handleKPIExpand = (kpiId) => {
    setExpandedKPI(expandedKPI === kpiId ? null : kpiId);
  };

  // Filter bookings if showing list
  const filteredBookings = useMemo(() => {
    if (!showBookingList) return [];
    
    if (!selectedStatus || selectedStatus === 'all') {
      return bookings;
    }
    
    return bookings.filter(booking => booking.status === selectedStatus);
  }, [bookings, selectedStatus, showBookingList]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>
          Booking Status
        </h3>
      </div>

      {/* Vertical Tabs and Booking List Layout */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Vertical Tabs */}
        <div className="flex md:flex-col gap-2 md:gap-1 md:w-40 w-full overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 md:pr-2">
          {statusConfig.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusClick(status.id)}
              className={`px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-900 whitespace-nowrap text-left
                ${selectedStatus === status.id
                  ? `${status.color} md:border-l-4 border-slate-700 shadow-[0_0_16px_var(--tw-ring-color)] ring-2 ring-accent ring-offset-2 ring-offset-slate-900`
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:shadow-[0_0_12px_var(--tw-ring-color)] hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-slate-900'}`}
            >
              <span className="font-semibold mr-2">{status.count}</span>
              <span className="text-xs">{status.label}</span>
            </button>
          ))}
        </div>

      {/* Combined Status KPIs - Shows booking+invoice combined status */}
      {!hideCombinedStatus && (
        <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Combined Booking & Invoice Status</h4>
          <div className="grid grid-cols-3 gap-2">
            {combinedStatusConfig.map((status) => (
              <div key={status.id} className="relative">
                <button
                  onClick={() => handleKPIExpand(`combined_${status.id}`)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${status.color} hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{status.count}</div>
                      <div className="text-xs">{status.label}</div>
                    </div>
                    {expandedKPI === `combined_${status.id}` ? 
                      <ChevronUpIcon className="w-4 h-4" /> : 
                      <ChevronDownIcon className="w-4 h-4" />
                    }
                  </div>
                </button>
                
                {/* Expandable Content */}
                {expandedKPI === `combined_${status.id}` && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-3 mt-1">
                    <h5 className="font-semibold text-sm mb-2">{status.label} Status Details</h5>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>Total Count: <span className="font-semibold">{status.count}</span></p>
                      <p className="text-slate-500">{status.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

        {/* Booking List (if enabled) */}
        {showBookingList && (
          <div className="bg-slate-50 rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700">
                {selectedStatus ? 
                  `${statusConfig.find(s => s.id === selectedStatus)?.label || 'Filtered'} Bookings` :
                  'All Bookings'
                }
              </h4>
              <div className="text-xs text-slate-500">
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <BookingIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No bookings found</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-gradient-to-br from-slate-100 via-slate-50 to-gray-200 border border-slate-300 rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-medium text-slate-900 truncate">
                            {booking.customer}
                          </h5>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {getCombinedStatus(booking)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-1">
                          <span>{booking.pickup} → {booking.destination}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{booking.date} at {booking.time}</span>
                          <span>€{booking.price || booking.amount || 0}</span>
                        </div>
                      </div>
                      
                      {/* Dropdown Action Menu (3 dots) */}
                      <div className="relative ml-2">
                        <button
                          className="p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          title="Actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedKPI(booking.id === expandedKPI ? null : booking.id);
                          }}
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="#64748b"/><circle cx="12" cy="12" r="2" fill="#64748b"/><circle cx="19" cy="12" r="2" fill="#64748b"/></svg>
                        </button>
                        {expandedKPI === booking.id && (
                          <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 border border-slate-300 rounded-xl shadow-xl z-20">
                            <ul className="py-1 text-sm">
                              {booking.status === 'pending' && (
                                <>
                                  <li>
                                    <button 
                                      className="w-full text-left px-4 py-2 hover:bg-green-50" 
                                      onClick={() => { confirmBooking(booking.id); setExpandedKPI(null); }}
                                    >
                                      Confirm Booking
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="w-full text-left px-4 py-2 hover:bg-red-50" 
                                      onClick={() => { deleteBooking(booking.id); setExpandedKPI(null); }}
                                    >
                                      Remove Booking
                                    </button>
                                  </li>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <>
                                  {booking.hasReturn ? (
                                    !booking.pickupCompleted ? (
                                      <li>
                                        <button 
                                          className="w-full text-left px-4 py-2 hover:bg-blue-50" 
                                          onClick={() => { updateBooking(booking.id, { ...booking, pickupCompleted: true }); setExpandedKPI(null); }}
                                        >
                                          Complete Pickup
                                        </button>
                                      </li>
                                    ) : !booking.returnCompleted ? (
                                      <li>
                                        <button 
                                          className="w-full text-left px-4 py-2 hover:bg-green-50" 
                                          onClick={() => { updateBooking(booking.id, { ...booking, returnCompleted: true, status: 'completed' }); setExpandedKPI(null); }}
                                        >
                                          Complete Return
                                        </button>
                                      </li>
                                    ) : null
                                  ) : (
                                    <li>
                                      <button 
                                        className="w-full text-left px-4 py-2 hover:bg-blue-50" 
                                        onClick={() => { updateBooking(booking.id, { ...booking, status: 'completed' }); setExpandedKPI(null); }}
                                      >
                                        Mark as Completed
                                      </button>
                                    </li>
                                  )}
                                  <li>
                                    <button 
                                      className="w-full text-left px-4 py-2 hover:bg-red-50" 
                                      onClick={() => { deleteBooking(booking.id); setExpandedKPI(null); }}
                                    >
                                      Remove Booking
                                    </button>
                                  </li>
                                </>
                              )}
                              {booking.status === 'completed' && (
                                <li>
                                  <span className="block px-4 py-2 text-slate-400">View Only</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div> {/* Close flex layout */}
    </div>
  );
}