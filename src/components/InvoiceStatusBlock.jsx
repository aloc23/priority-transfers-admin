import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import { PlusIcon, InvoiceIcon, ChevronDownIcon, ChevronUpIcon, SendIcon, EditIcon } from './Icons';
import InvoiceEditModal from './InvoiceEditModal';

export default function InvoiceStatusBlock({ 
  compact = false, 
  showAddButtons = false, 
  showInvoiceList = false,
  onStatusFilter = null 
}) {
  const { invoices, bookings, generateInvoiceFromBooking, addInvoice, markInvoiceAsPaid, sendInvoice, updateInvoice, cancelInvoice, addActivityLog } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
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
    setEditingInvoice(null);
    setShowEditModal(true);
  };

  // Handle Edit Invoice
  const handleEditInvoice = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setEditingInvoice(invoice);
      setShowEditModal(true);
    }
  };

  // Handle Save Invoice (from edit modal)
  const handleSaveInvoice = (invoiceData, editingInvoice) => {
    if (editingInvoice) {
      // Update existing invoice
      const updates = {
        ...invoiceData
      };
      
      // Track changes for audit trail
      const changes = [];
      if (editingInvoice.customer !== invoiceData.customer) changes.push(`Customer: ${editingInvoice.customer} → ${invoiceData.customer}`);
      if (editingInvoice.customerEmail !== invoiceData.customerEmail) changes.push(`Email: ${editingInvoice.customerEmail} → ${invoiceData.customerEmail}`);
      if (editingInvoice.amount !== invoiceData.amount) changes.push(`Amount: €${editingInvoice.amount} → €${invoiceData.amount}`);
      if (editingInvoice.type !== invoiceData.type) changes.push(`Type: ${editingInvoice.type} → ${invoiceData.type}`);
      
      updateInvoice(editingInvoice.id, updates);
      
      // Add activity log for the update
      if (addActivityLog && changes.length > 0) {
        addActivityLog({
          type: 'invoice_updated',
          description: `Invoice #${editingInvoice.id} updated: ${changes.join(', ')}`,
          relatedId: editingInvoice.id
        });
      }
    } else {
      // Create new invoice
      const result = addInvoice(invoiceData);
      
      // Add activity log for the creation
      if (addActivityLog) {
        const bookingText = invoiceData.bookingId ? ` (linked to Booking #${invoiceData.bookingId})` : '';
        addActivityLog({
          type: 'invoice_created',
          description: `Invoice created for ${invoiceData.customer} (€${invoiceData.amount})${bookingText}`,
          relatedId: result.invoice?.id
        });
      }
    }
    
    setEditingInvoice(null);
  };

  // Handle View Invoice
  const handleViewInvoice = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const invoiceDetails = `
Invoice #${invoice.id}
Customer: ${invoice.customer}
Amount: €${invoice.amount}
Date: ${invoice.date}
Status: ${invoice.status}
${invoice.description ? `Description: ${invoice.description}` : ''}
${invoice.bookingId ? `Booking ID: ${invoice.bookingId}` : ''}
      `.trim();
      
      alert(invoiceDetails);
    }
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
  <>
    <div className="space-y-4 bg-slate-50 rounded-2xl shadow-2xl border-2 border-slate-300 p-8 mb-8">
    {/* Header with title and optional add buttons */}
    <div className="flex items-center justify-between mb-4">
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

    {/* Vertical Tabs and Invoice List Layout */}
  <div className="flex flex-col md:flex-row gap-4">
  {/* Vertical Tabs */}
  <div className="flex md:flex-col gap-2 md:gap-1 md:w-40 w-full overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 md:pr-2">
        {statusConfig.map((status) => (
          <button
            key={status.id}
            onClick={() => setSelectedStatus(selectedStatus === status.id ? null : status.id)}
            className={`px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 focus:outline-none whitespace-nowrap text-left
              ${selectedStatus === status.id
                ? `${status.color} md:border-l-4 border-slate-700 shadow`
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <span className="font-semibold mr-2">{status.count}</span>
            <span className="text-xs">{status.label}</span>
          </button>
        ))}
      </div>

      {/* Invoice List (if enabled) */}
      {showInvoiceList && (
        <div className="bg-slate-50 rounded-xl p-4 flex-1">
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
              filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="bg-gradient-to-br from-slate-100 via-slate-50 to-gray-200 border border-slate-300 rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow">
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
                          {invoice.status === 'pending' ? 'Draft' : 
                            invoice.status === 'sent' ? 'Invoiced' :
                            invoice.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>#{invoice.id}</span>
                        <span>€{invoice.amount}</span>
                        <span>{invoice.date}</span>
                      </div>
                    </div>
                    {/* Dropdown Action Menu (3 dots) */}
                    <div className="relative ml-2">
                      <button
                        className="p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        title="Actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedKPI(invoice.id === expandedKPI ? null : invoice.id);
                        }}
                      >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="#64748b"/><circle cx="12" cy="12" r="2" fill="#64748b"/><circle cx="19" cy="12" r="2" fill="#64748b"/></svg>
                      </button>
                      {expandedKPI === invoice.id && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 border border-slate-300 rounded-xl shadow-xl z-20">
                          <ul className="py-1 text-sm">
                            {invoice.status === 'pending' && (
                              <>
                                <li>
                                  <button className="w-full text-left px-4 py-2 hover:bg-blue-50" onClick={() => { handleEditInvoice(invoice.id); setExpandedKPI(null); }}>
                                    <EditIcon className="w-4 h-4 inline mr-2" /> Edit Draft
                                  </button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-4 py-2 hover:bg-green-50" onClick={() => { handleSendInvoice(invoice.id, invoice); setExpandedKPI(null); }}>
                                    <SendIcon className="w-4 h-4 inline mr-2" /> Send Invoice
                                  </button>
                                </li>
                              </>
                            )}
                            {invoice.status === 'sent' && (
                              <>
                                <li>
                                  <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={() => { handleViewInvoice(invoice.id); setExpandedKPI(null); }}>
                                    <InvoiceIcon className="w-4 h-4 inline mr-2" /> View Invoice
                                  </button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-4 py-2 hover:bg-blue-50" onClick={() => { handleEditInvoice(invoice.id); setExpandedKPI(null); }}>
                                    <EditIcon className="w-4 h-4 inline mr-2" /> Edit Invoice
                                  </button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-4 py-2 hover:bg-green-50" onClick={() => { handleMarkAsPaid(invoice.id); setExpandedKPI(null); }}>
                                    <SendIcon className="w-4 h-4 inline mr-2" /> Mark as Paid
                                  </button>
                                </li>
                              </>
                            )}
                            {invoice.status === 'paid' && (
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
    </div> {/* Close main container */}
    <InvoiceEditModal
      show={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setEditingInvoice(null);
      }}
      editingInvoice={editingInvoice}
      onSave={handleSaveInvoice}
    />

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
  </>
  );
}
