import React from 'react';
import { 
  InvoiceIcon, 
  HistoryIcon, 
  SendIcon, 
  SuccessIcon, 
  WarningIcon, 
  XIcon 
} from './Icons';

export default function InvoiceStatusPills({ 
  invoices = [], 
  selectedStatus = 'all', 
  onStatusChange = null,
  compact = false 
}) {
  // Calculate status counts
  const statusCounts = {
    all: invoices.length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    cancelled: invoices.filter(inv => inv.status === 'cancelled').length
  };

  // Status configuration with icons and colors
  const statusConfig = [
    {
      id: 'all',
      label: 'All Statuses',
      count: statusCounts.all,
      icon: InvoiceIcon,
      color: 'bg-slate-500 hover:bg-slate-600',
      activeColor: 'bg-slate-600 ring-2 ring-slate-300',
      textColor: 'text-white'
    },
    {
      id: 'pending',
      label: 'Pending',
      count: statusCounts.pending,
      icon: HistoryIcon,
      color: 'bg-amber-500 hover:bg-amber-600',
      activeColor: 'bg-amber-600 ring-2 ring-amber-300',
      textColor: 'text-white'
    },
    {
      id: 'sent',
      label: 'Sent',
      count: statusCounts.sent,
      icon: SendIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      activeColor: 'bg-blue-600 ring-2 ring-blue-300',
      textColor: 'text-white'
    },
    {
      id: 'paid',
      label: 'Paid',
      count: statusCounts.paid,
      icon: SuccessIcon,
      color: 'bg-green-500 hover:bg-green-600',
      activeColor: 'bg-green-600 ring-2 ring-green-300',
      textColor: 'text-white'
    },
    {
      id: 'overdue',
      label: 'Overdue',
      count: statusCounts.overdue,
      icon: WarningIcon,
      color: 'bg-red-500 hover:bg-red-600',
      activeColor: 'bg-red-600 ring-2 ring-red-300',
      textColor: 'text-white'
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: statusCounts.cancelled,
      icon: XIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
      activeColor: 'bg-gray-600 ring-2 ring-gray-300',
      textColor: 'text-white'
    }
  ];

  const handleStatusClick = (statusId) => {
    const newStatus = selectedStatus === statusId ? 'all' : statusId;
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
      {statusConfig.map((status) => {
        const Icon = status.icon;
        const isActive = selectedStatus === status.id;
        
        return (
          <button
            key={status.id}
            onClick={() => handleStatusClick(status.id)}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isActive 
                ? `${status.activeColor} ${status.textColor} shadow-lg transform scale-105` 
                : `${status.color} ${status.textColor} shadow hover:shadow-md hover:transform hover:scale-102`
              }
              ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}
            `}
            title={`${status.label}: ${status.count} invoice${status.count !== 1 ? 's' : ''}`}
          >
            <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
            <span className="font-semibold">{status.count}</span>
            <span className={`${compact ? 'hidden sm:inline' : ''}`}>{status.label}</span>
          </button>
        );
      })}
    </div>
  );
}