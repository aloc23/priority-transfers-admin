import { useMemo } from 'react';
import { useAppStore } from '../context/AppStore';

export default function CombinedStatusSummary({ compact = false }) {
  const { bookings, invoices } = useAppStore();

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

      {/* Status Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusConfig.map((status) => (
          <div 
            key={status.id} 
            className={`px-4 py-3 rounded-lg border-2 border-transparent ${status.color} hover:border-slate-300 transition-all duration-200`}
            title={status.description}
          >
            <div className="text-center">
              <div className="font-bold text-xl mb-1">{status.count}</div>
              <div className="text-sm font-medium">{status.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Flow Indicator */}
      <div className="mt-6 bg-slate-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Booking Progress Flow</h4>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <span>Pending</span>
          </div>
          <div className="flex-1 h-px bg-slate-300 mx-2"></div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex-1 h-px bg-slate-300 mx-2"></div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Completed</span>
          </div>
          <div className="flex-1 h-px bg-slate-300 mx-2"></div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Invoiced</span>
          </div>
          <div className="flex-1 h-px bg-slate-300 mx-2"></div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span>Paid</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-700">
            {combinedStatusCounts.Pending + combinedStatusCounts.Confirmed}
          </div>
          <div className="text-xs text-slate-500">Active Bookings</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-700">
            {combinedStatusCounts.Completed + combinedStatusCounts.Invoiced}
          </div>
          <div className="text-xs text-slate-500">Awaiting Payment</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-700">
            {combinedStatusCounts.Paid}
          </div>
          <div className="text-xs text-slate-500">Fully Completed</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-lg font-bold text-red-600">
            {combinedStatusCounts.Overdue}
          </div>
          <div className="text-xs text-slate-500">Require Attention</div>
        </div>
      </div>
    </div>
  );
}