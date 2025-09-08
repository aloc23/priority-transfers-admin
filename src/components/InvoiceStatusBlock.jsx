import { useState, useMemo } from 'react';
import { useAppStore } from '../context/AppStore';
import { PlusIcon, InvoiceIcon, ChevronDownIcon, ChevronUpIcon, SendIcon, EditIcon } from './Icons';

export default function InvoiceStatusBlock({ 
  compact = false, 
  showAddButtons = false, 
  showInvoiceList = false,
  onStatusFilter = null 
}) {
  const { invoices, bookings, generateInvoiceFromBooking, addInvoice, markInvoiceAsPaid, sendInvoice, updateInvoice, cancelInvoice } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedKPI, setExpandedKPI] = useState(null);

  // Calculate invoice status counts
  const invoiceStatusCounts = useMemo(() => {
    const counts = {
      all: invoices.length,
      pending: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0
    };

    invoices.forEach(invoice => {
      if (counts[invoice.status] !== undefined) {
        counts[invoice.status]++;
      }
    });

    return counts;
  }, [invoices]);

  // Calculate pending invoices for confirmed bookings only
  const properPendingInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      if (invoice.status !== 'pending') return false;
      if (!invoice.bookingId) return true; // Independent invoices are always valid
      
      const booking = bookings.find(b => b.id === invoice.bookingId);
      return booking && booking.status === 'confirmed'; // Only show pending invoices for confirmed bookings
    });
  }, [invoices, bookings]);

  // Adjusted counts with proper pending logic
  const adjustedInvoiceStatusCounts = useMemo(() => {
    const counts = { ...invoiceStatusCounts };
    counts.pending = properPendingInvoices.length;
    return counts;
  }, [invoiceStatusCounts, properPendingInvoices]);

  // Status configuration
  const statusConfig = [
    { 
      id: 'all', 
      label: 'All Statuses', 
      count: adjustedInvoiceStatusCounts.all, 
      color: 'bg-slate-600 text-white hover:bg-slate-700',
      activeColor: 'bg-slate-600 text-white shadow-lg',
      description: 'All invoices in the system'
    },
    { 
      id: 'pending', 
      label: 'Pending', 
      count: adjustedInvoiceStatusCounts.pending, 
      color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      activeColor: 'bg-amber-600 text-white shadow-lg',
      description: 'Invoices awaiting payment (only for confirmed bookings)'
    },
    { 
      id: 'sent', 
      label: 'Sent', 
      count: adjustedInvoiceStatusCounts.sent, 
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      activeColor: 'bg-blue-600 text-white shadow-lg',
      description: 'Invoices that have been sent to customers'
    },
    { 
      id: 'paid', 
      label: 'Paid', 
      count: adjustedInvoiceStatusCounts.paid, 
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      activeColor: 'bg-green-600 text-white shadow-lg',
      description: 'Invoices that have been fully paid'
    },
    { 
      id: 'overdue', 
      label: 'Overdue', 
      count: adjustedInvoiceStatusCounts.overdue, 
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      activeColor: 'bg-red-600 text-white shadow-lg',
      description: 'Invoices that are past their due date'
    },
    { 
      id: 'cancelled', 
      label: 'Cancelled', 
      count: adjustedInvoiceStatusCounts.cancelled, 
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      activeColor: 'bg-gray-600 text-white shadow-lg',
      description: 'Invoices that have been cancelled'
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

  // Handle invoice actions
  const handleMarkAsPaid = (invoiceId) => {
    markInvoiceAsPaid(invoiceId);
  };

  const handleSendInvoice = (invoiceId, invoice) => {
    const email = invoice.customerEmail || prompt('Enter customer email:');
    if (email) {
      sendInvoice(invoiceId, email);
    }
  };

  const handleCancelInvoice = (invoiceId) => {
    if (confirm('Are you sure you want to cancel this invoice?')) {
      cancelInvoice(invoiceId);
    }
  };

  // Handle Generate from Booking
  const handleGenerateFromBooking = () => {
    const completedBookings = bookings.filter(booking => booking.status === "completed");
    const bookingWithoutInvoice = completedBookings.find(booking => 
      !invoices.some(inv => inv.bookingId === booking.id)
    );
    
    if (bookingWithoutInvoice) {
      generateInvoiceFromBooking(bookingWithoutInvoice);
    } else {
      alert('All completed bookings already have invoices generated');
    }
  };

  // Handle New Invoice
  const handleNewInvoice = () => {
    setShowModal(true);
  };

  // Filter invoices if showing list
  const filteredInvoices = useMemo(() => {
    if (!showInvoiceList) return [];
    
    if (!selectedStatus || selectedStatus === 'all') {
      return invoices;
    }
    
    return invoices.filter(invoice => invoice.status === selectedStatus);
  }, [invoices, selectedStatus, showInvoiceList]);

  return (
    <div className="space-y-4">
      {/* Header with title and optional add buttons */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>
          Invoice Status
        </h3>
        {showAddButtons && (
          <div className="flex gap-2">
            <button 
              onClick={handleGenerateFromBooking}
              className="btn btn-outline btn-sm flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Generate from Booking
            </button>
            <button 
              onClick={handleNewInvoice}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              New Invoice
            </button>
          </div>
        )}
      </div>

      {/* Status Pills - Now Expandable KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {statusConfig.map((status) => (
          <div key={status.id} className="relative">
            <button
              onClick={() => handleKPIExpand(status.id)}
              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${status.color} hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{status.count}</div>
                  <div className="text-xs">{status.label}</div>
                </div>
                {expandedKPI === status.id ? 
                  <ChevronUpIcon className="w-4 h-4" /> : 
                  <ChevronDownIcon className="w-4 h-4" />
                }
              </div>
            </button>
            
            {/* Expandable Content */}
            {expandedKPI === status.id && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-3 mt-1">
                <h4 className="font-semibold text-sm mb-2">{status.label} Invoices Details</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>Total Count: <span className="font-semibold">{status.count}</span></p>
                  <p className="text-slate-500">{status.description}</p>
                  <p>Total Value: <span className="font-semibold">
                    €{invoices
                      .filter(inv => status.id === 'all' || inv.status === status.id)
                      .reduce((sum, inv) => sum + (inv.amount || 0), 0)
                      .toFixed(2)
                    }
                  </span></p>
                  {status.id === 'pending' && (
                    <p className="text-amber-600">⚠️ Only includes invoices for confirmed bookings</p>
                  )}
                </div>
                <button
                  onClick={() => handleStatusClick(status.id)}
                  className="mt-2 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
                >
                  View {status.label} Invoices
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Invoice List (if enabled) */}
      {showInvoiceList && (
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700">
              {selectedStatus ? 
                `${statusConfig.find(s => s.id === selectedStatus)?.label || 'Filtered'} Invoices` :
                'All Invoices'
              }
            </h4>
            <div className="text-xs text-slate-500">
              {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <InvoiceIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No invoices found</p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                // Determine next logical action
                let actionButton = null;
                if (invoice.status === 'pending' || invoice.status === 'sent') {
                  actionButton = (
                    <button
                      onClick={() => handleMarkAsPaid(invoice.id)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-all"
                      title="Mark as Paid"
                    >
                      € Paid
                    </button>
                  );
                } else if (invoice.status === 'pending') {
                  actionButton = (
                    <button
                      onClick={() => handleSendInvoice(invoice.id, invoice)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-all"
                      title="Send Invoice"
                    >
                      <SendIcon className="w-3 h-3 mr-1" />
                      Send
                    </button>
                  );
                }

                return (
                  <div key={invoice.id} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-medium text-slate-900 truncate">
                            {invoice.customer}
                          </h5>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>#{invoice.id}</span>
                          <span>€{invoice.amount}</span>
                          <span>{invoice.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {actionButton}
                        {(invoice.status !== 'paid' && invoice.status !== 'cancelled') && (
                          <button
                            onClick={() => handleCancelInvoice(invoice.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-all"
                            title="Cancel Invoice"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Simple Invoice Modal (basic version) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Invoice</h2>
              <p className="text-slate-600 mb-4">
                This feature opens the full invoice creation form.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Open Invoice Form
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}