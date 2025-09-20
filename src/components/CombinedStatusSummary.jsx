import { useMemo } from 'react';
import { useAppStore } from '../context/AppStore';
import { useResponsive } from '../hooks/useResponsive';

export default function CombinedStatusSummary({ compact = false }) {
  const { bookings, invoices } = useAppStore();
  const { isMobile, isSmallMobile } = useResponsive();

  // Combined booking/invoice status logic (same as in BookingStatusBlock)
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

  // Combined status configuration with colors
  const statusConfig = [
    { 
      id: 'Pending', 
      label: 'Pending', 
      count: combinedStatusCounts.Pending, 
      color: 'bg-amber-100 text-amber-800',
      description: 'Bookings awaiting confirmation'
    },
    { 
      id: 'Confirmed', 
      label: 'Confirmed', 
      count: combinedStatusCounts.Confirmed, 
      color: 'bg-green-100 text-green-800',
      description: 'Bookings confirmed and ready for service'
    },
    { 
      id: 'Completed', 
      label: 'Completed', 
      count: combinedStatusCounts.Completed, 
      color: 'bg-blue-100 text-blue-800',
      description: 'Bookings completed but not yet invoiced'
    },
    { 
      id: 'Invoiced', 
      label: 'Invoiced', 
      count: combinedStatusCounts.Invoiced, 
      color: 'bg-orange-100 text-orange-800',
      description: 'Bookings completed and invoiced, awaiting payment'
    },
    { 
      id: 'Paid', 
      label: 'Paid', 
      count: combinedStatusCounts.Paid, 
      color: 'bg-emerald-100 text-emerald-800',
      description: 'Bookings fully completed and paid'
    },
    { 
      id: 'Overdue', 
      label: 'Overdue', 
      count: combinedStatusCounts.Overdue, 
      color: 'bg-red-100 text-red-800',
      description: 'Bookings with overdue invoices'
    }
  ].filter(status => status.count > 0 || ['Pending', 'Confirmed', 'Invoiced', 'Paid', 'Overdue'].includes(status.id)); // Always show key statuses

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-semibold text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>
            Combined Booking & Invoice Status
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Overview of booking progress from confirmation to payment
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Status Summary Grid - Improved mobile layout */}
      <div className={`grid gap-3 ${
        isMobile 
          ? 'grid-cols-2 sm:grid-cols-3' 
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
      }`}>
        {statusConfig.map((status) => (
          <div 
            key={status.id} 
            className={`
              rounded-lg border-2 border-transparent ${status.color} 
              hover:border-slate-300 transition-all duration-200
              ${isMobile 
                ? 'px-3 py-3 min-h-[72px]' 
                : 'px-4 py-3'
              }
            `}
            title={status.description}
          >
            <div className="text-center flex flex-col justify-center h-full">
              <div className={`font-bold mb-1 ${
                isMobile 
                  ? 'text-lg leading-tight' 
                  : 'text-xl'
              }`}>
                {status.count}
              </div>
              <div className={`font-medium leading-tight ${
                isMobile 
                  ? 'text-xs' 
                  : 'text-sm'
              }`}>
                {status.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Flow Indicator - Mobile optimized */}
      <div className="mt-6 bg-slate-50 rounded-xl p-4">
        <h4 className={`font-semibold text-slate-700 mb-3 ${
          isMobile ? 'text-xs text-center' : 'text-sm'
        }`}>
          Booking Progress Flow
        </h4>
        <div className={`flex items-center justify-between ${
          isMobile 
            ? 'text-xs text-slate-500 px-1' 
            : 'text-xs text-slate-500'
        }`}>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className={`bg-amber-400 rounded-full ${
              isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
            }`}></div>
            <span className={isMobile ? 'text-xs' : ''}>
              {isMobile ? 'Pending' : 'Pending'}
            </span>
          </div>
          <div className={`h-px bg-slate-300 ${
            isMobile ? 'flex-1 mx-1' : 'flex-1 mx-2'
          }`}></div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className={`bg-green-400 rounded-full ${
              isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
            }`}></div>
            <span className={isMobile ? 'text-xs' : ''}>
              {isMobile ? 'Confirmed' : 'Confirmed'}
            </span>
          </div>
          <div className={`h-px bg-slate-300 ${
            isMobile ? 'flex-1 mx-1' : 'flex-1 mx-2'
          }`}></div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className={`bg-blue-400 rounded-full ${
              isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
            }`}></div>
            <span className={isMobile ? 'text-xs' : ''}>
              {isMobile ? 'Done' : 'Completed'}
            </span>
          </div>
          <div className={`h-px bg-slate-300 ${
            isMobile ? 'flex-1 mx-1' : 'flex-1 mx-2'
          }`}></div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className={`bg-orange-400 rounded-full ${
              isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
            }`}></div>
            <span className={isMobile ? 'text-xs' : ''}>
              {isMobile ? 'Invoiced' : 'Invoiced'}
            </span>
          </div>
          <div className={`h-px bg-slate-300 ${
            isMobile ? 'flex-1 mx-1' : 'flex-1 mx-2'
          }`}></div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className={`bg-emerald-400 rounded-full ${
              isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
            }`}></div>
            <span className={isMobile ? 'text-xs' : ''}>
              {isMobile ? 'Paid' : 'Paid'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats - Mobile optimized */}
      <div className={`mt-4 grid gap-4 text-center ${
        isMobile 
          ? 'grid-cols-2' 
          : 'grid-cols-2 md:grid-cols-4'
      }`}>
        <div className={`bg-slate-50 rounded-lg ${
          isMobile ? 'p-2' : 'p-3'
        }`}>
          <div className={`font-bold text-slate-700 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            {combinedStatusCounts.Pending + combinedStatusCounts.Confirmed}
          </div>
          <div className={`text-slate-500 ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>
            Active Bookings
          </div>
        </div>
        <div className={`bg-slate-50 rounded-lg ${
          isMobile ? 'p-2' : 'p-3'
        }`}>
          <div className={`font-bold text-slate-700 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            {combinedStatusCounts.Completed + combinedStatusCounts.Invoiced}
          </div>
          <div className={`text-slate-500 ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>
            Awaiting Payment
          </div>
        </div>
        <div className={`bg-slate-50 rounded-lg ${
          isMobile ? 'p-2' : 'p-3'
        }`}>
          <div className={`font-bold text-slate-700 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            {combinedStatusCounts.Paid}
          </div>
          <div className={`text-slate-500 ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>
            Fully Completed
          </div>
        </div>
        <div className={`bg-slate-50 rounded-lg ${
          isMobile ? 'p-2' : 'p-3'
        }`}>
          <div className={`font-bold text-red-600 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            {combinedStatusCounts.Overdue}
          </div>
          <div className={`text-slate-500 ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>
            Require Attention
          </div>
        </div>
      </div>
    </div>
  );
}