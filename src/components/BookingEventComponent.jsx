import React from 'react';

// Shared booking event component for consistent rendering across Dashboard and Schedule calendars
export default function BookingEventComponent({ event, compact = false, isMobile = false }) {
  const resource = event.resource || event;
  
  // Get combined status (matches Schedule.jsx logic)
  const getCombinedStatus = (booking) => {
    if (!booking) return 'Other';
    if (booking.status === 'pending') return 'Pending';
    if (booking.status === 'confirmed') return 'Confirmed';
    if (booking.status === 'completed') return 'Completed';
    // For invoice-related statuses, we'd need access to invoices context
    // For now, default to booking status
    if (booking.status === 'cancelled') return 'Cancelled';
    return 'Other';
  };

  const status = getCombinedStatus(resource);
  
  // Status color mapping (consistent with Schedule.jsx)
  const statusColorMap = {
    Pending: '#fbbf24',      // amber-400
    Confirmed: '#22c55e',    // green-500
    Completed: '#3b82f6',    // blue-500
    Invoiced: '#f59e42',     // orange-400
    Paid: '#2563eb',         // blue-600
    Overdue: '#ef4444',      // red-500
    Cancelled: '#64748b',    // slate-500
    Other: '#a3a3a3'         // neutral-400
  };

  // Badge class mapping for Dashboard style
  const getBadgeClass = () => {
    if (resource?.isOutsourced) return 'badge badge-yellow';
    if (resource?.legType === 'return') return 'badge badge-cyan';
    
    switch (status) {
      case 'Pending': return 'badge badge-yellow';
      case 'Confirmed': return 'badge badge-green';
      case 'Completed': return 'badge badge-blue';
      case 'Invoiced': return 'badge badge-orange';
      case 'Paid': return 'badge badge-blue';
      case 'Overdue': return 'badge badge-red';
      case 'Cancelled': return 'badge badge-gray';
      default: return 'badge badge-blue';
    }
  };

  // Compact version for Schedule (just status dots)
  if (compact) {
    return (
      <div className="flex items-center justify-center h-4">
        <div 
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: statusColorMap[status] || '#a3a3a3'
          }}
          title={`${status} - ${resource?.customer || 'Booking'}`}
        />
      </div>
    );
  }

  // Full version for Dashboard (badges + text)
  return (
  <div className="group relative h-full flex items-center gap-2 hover:scale-105 hover:shadow-[0_0_12px_var(--tw-ring-color)] transition-transform duration-200">
      <span 
  className={`${getBadgeClass()} transition-all duration-200 group-hover:shadow-[0_0_8px_var(--tw-ring-color)] group-hover:-translate-y-0.5`}
        style={{
          fontWeight: 600, 
          fontSize: isMobile ? '9px' : '10px'
        }}
      >
        {resource?.isOutsourced ? 'Partner' : 
         resource?.legType === 'return' ? 'Return' : 
         status}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-xs leading-tight truncate">
          {event.title}
        </div>
        {resource?.legType && (
          <div className="text-xs opacity-90 truncate">
            {resource.legType === 'pickup' ? '↑ Pickup' : '↓ Return'}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
  {/* Glow overlay for block */}
  <div className="absolute inset-0 pointer-events-none rounded-xl group-hover:bg-accent/10 transition-all duration-200" />
    </div>
  );
}

// Enhanced version that can access invoice context for full combined status
export function BookingEventWithInvoices({ event, invoices = [], compact = false, isMobile = false }) {
  const resource = event.resource || event;
  
  // Full combined status logic (matches Schedule.jsx exactly)
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

  const status = getCombinedStatus(resource);
  
  // Status color mapping (consistent with Schedule.jsx)
  const statusColorMap = {
    Pending: '#fbbf24',      // amber-400
    Confirmed: '#22c55e',    // green-500
    Completed: '#3b82f6',    // blue-500
    Invoiced: '#f59e42',     // orange-400
    Paid: '#2563eb',         // blue-600
    Overdue: '#ef4444',      // red-500
    Cancelled: '#64748b',    // slate-500
    Other: '#a3a3a3'         // neutral-400
  };

  // Badge class mapping for Dashboard style
  const getBadgeClass = () => {
    if (resource?.isOutsourced) return 'badge badge-yellow';
    if (resource?.legType === 'return') return 'badge badge-cyan';
    
    switch (status) {
      case 'Pending': return 'badge badge-yellow';
      case 'Confirmed': return 'badge badge-green';
      case 'Completed': return 'badge badge-blue';
      case 'Invoiced': return 'badge badge-orange';
      case 'Paid': return 'badge badge-blue';
      case 'Overdue': return 'badge badge-red';
      case 'Cancelled': return 'badge badge-gray';
      default: return 'badge badge-blue';
    }
  };

  // Compact version for Schedule (just status dots)
  if (compact) {
    return (
      <div className="flex items-center justify-center h-4">
        <div 
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: statusColorMap[status] || '#a3a3a3'
          }}
          title={`${status} - ${resource?.customer || 'Booking'}`}
        />
      </div>
    );
  }

  // Full version for Dashboard (badges + text)
  return (
    <div className="group relative h-full flex items-center gap-2 hover:scale-105 transition-transform duration-200">
      <span 
        className={getBadgeClass()} 
        style={{
          fontWeight: 600, 
          fontSize: isMobile ? '9px' : '10px'
        }}
      >
        {resource?.isOutsourced ? 'Partner' : 
         resource?.legType === 'return' ? 'Return' : 
         status}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-xs leading-tight truncate">
          {event.title}
        </div>
        {resource?.legType && (
          <div className="text-xs opacity-90 truncate">
            {resource.legType === 'pickup' ? '↑ Pickup' : '↓ Return'}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
    </div>
  );
}