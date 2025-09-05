import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { formatCurrency, calculateRevenue, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { 
  RevenueIcon, 
  InvoiceIcon, 
  ViewIcon, 
  EditIcon, 
  SendIcon, 
  DownloadIcon, 
  XIcon, 
  PlusIcon,
  FilterIcon
} from "../components/Icons";

export default function Billing() {
  const { 
    bookings, 
    customers,
    invoices, 
    updateInvoice, 
    cancelInvoice, 
    sendInvoice, 
    generateInvoiceFromBooking,
    addInvoice,
    markInvoiceAsPaid,
    addActivityLog
  } = useAppStore();
  
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all'); // internal/bookings, outsourced, ad hoc
  const [filterBookingAssociation, setFilterBookingAssociation] = useState('all'); // linked, unlinked
  const [selectedInvoices, setSelectedInvoices] = useState(new Set());
  const [formData, setFormData] = useState({
    customer: '',
    customerEmail: '',
    amount: EURO_PRICE_PER_BOOKING,
    items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }],
    bookingId: null, // For manual booking association
    type: 'priority' // Default type
  });

  const completedBookings = bookings.filter(booking => booking.status === "completed");
  const totalRevenue = calculateRevenue(bookings, "completed", invoices);
  const pendingPayments = invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);

  // Helper function to get booking details for an invoice
  const getBookingForInvoice = (invoice) => {
    if (!invoice.bookingId) return null;
    return bookings.find(booking => booking.id === invoice.bookingId);
  };

  // Enhanced filter logic for invoices
  const filteredInvoices = invoices.filter(invoice => {
    const statusMatch = filterStatus === 'all' || invoice.status === filterStatus;
    const typeMatch = filterType === 'all' || invoice.type === filterType;
    
    // Source filter logic
    let sourceMatch = true;
    if (filterSource === 'internal') {
      sourceMatch = invoice.bookingId !== null && invoice.type === 'priority';
    } else if (filterSource === 'outsourced') {
      sourceMatch = invoice.type === 'outsourced';
    } else if (filterSource === 'adhoc') {
      sourceMatch = invoice.bookingId === null;
    }
    
    // Booking association filter logic
    let bookingMatch = true;
    if (filterBookingAssociation === 'linked') {
      bookingMatch = invoice.bookingId !== null;
    } else if (filterBookingAssociation === 'unlinked') {
      bookingMatch = invoice.bookingId === null;
    }
    
    return statusMatch && typeMatch && sourceMatch && bookingMatch;
  });

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customer: invoice.customer,
      customerEmail: invoice.customerEmail,
      amount: invoice.amount,
      items: invoice.items || [{ description: '', quantity: 1, rate: invoice.amount, amount: invoice.amount }],
      bookingId: invoice.bookingId || null,
      type: invoice.type || 'priority'
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);
    
    if (editingInvoice) {
      // Update existing invoice
      const updates = {
        ...formData,
        amount: totalAmount
      };
      
      // Track changes for audit trail
      const changes = [];
      if (editingInvoice.customer !== formData.customer) changes.push(`Customer: ${editingInvoice.customer} → ${formData.customer}`);
      if (editingInvoice.customerEmail !== formData.customerEmail) changes.push(`Email: ${editingInvoice.customerEmail} → ${formData.customerEmail}`);
      if (editingInvoice.amount !== totalAmount) changes.push(`Amount: ${formatCurrency(editingInvoice.amount)} → ${formatCurrency(totalAmount)}`);
      if (editingInvoice.type !== formData.type) changes.push(`Type: ${editingInvoice.type} → ${formData.type}`);
      if (editingInvoice.bookingId !== formData.bookingId) {
        const oldBooking = editingInvoice.bookingId ? `Booking #${editingInvoice.bookingId}` : 'No booking';
        const newBooking = formData.bookingId ? `Booking #${formData.bookingId}` : 'No booking';
        changes.push(`Booking Association: ${oldBooking} → ${newBooking}`);
      }
      
      updateInvoice(editingInvoice.id, updates);
      
      // Add audit trail entry for updates
      if (changes.length > 0) {
        addActivityLog({
          type: 'invoice_updated',
          description: `Invoice ${editingInvoice.id} updated: ${changes.join(', ')}`,
          relatedId: editingInvoice.id
        });
      }
    } else {
      // Create new invoice
      const result = addInvoice({
        customer: formData.customer,
        customerEmail: formData.customerEmail,
        amount: totalAmount,
        items: formData.items,
        description: formData.items[0]?.description || 'Service provided',
        type: formData.type,
        bookingId: formData.bookingId
      });
      
      if (!result.success) {
        alert('Failed to create invoice: ' + result.error);
        return;
      }
      
      // Add audit trail entry for new invoice
      const bookingText = formData.bookingId ? ` linked to Booking #${formData.bookingId}` : ' (ad hoc)';
      addActivityLog({
        type: 'invoice_created',
        description: `Invoice created for ${formData.customer} (${formatCurrency(totalAmount)})${bookingText}`,
        relatedId: result.invoice?.id
      });
    }
    
    setShowModal(false);
    setEditingInvoice(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      customerEmail: '',
      amount: EURO_PRICE_PER_BOOKING,
      items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }],
      bookingId: null,
      type: 'priority'
    });
  };

  // Enhanced payment handling functions
  const handleSinglePayment = (invoiceId) => {
    const result = markInvoiceAsPaid(invoiceId);
    if (result.success) {
      // Remove from selection if it was selected
      const newSelection = new Set(selectedInvoices);
      newSelection.delete(invoiceId);
      setSelectedInvoices(newSelection);
    } else {
      alert('Failed to mark invoice as paid: ' + result.error);
    }
  };

  const handleBulkPayment = () => {
    if (selectedInvoices.size === 0) {
      alert('Please select invoices to mark as paid');
      return;
    }

    const confirmPayment = confirm(`Mark ${selectedInvoices.size} invoice(s) as paid?`);
    if (!confirmPayment) return;

    let successCount = 0;
    let errorCount = 0;

    selectedInvoices.forEach(invoiceId => {
      const result = markInvoiceAsPaid(invoiceId);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    });

    if (successCount > 0) {
      alert(`${successCount} invoice(s) marked as paid successfully!`);
      setSelectedInvoices(new Set()); // Clear selection
    }

    if (errorCount > 0) {
      alert(`${errorCount} invoice(s) failed to process`);
    }
  };

  const handleSelectInvoice = (invoiceId, checked) => {
    const newSelection = new Set(selectedInvoices);
    if (checked) {
      newSelection.add(invoiceId);
    } else {
      newSelection.delete(invoiceId);
    }
    setSelectedInvoices(newSelection);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const payableInvoices = filteredInvoices
        .filter(inv => inv.status === 'sent' || inv.status === 'pending')
        .map(inv => inv.id);
      setSelectedInvoices(new Set(payableInvoices));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  // Get payable invoices for bulk operations
  const payableInvoices = filteredInvoices.filter(inv => 
    inv.status === 'sent' || inv.status === 'pending'
  );

  const handleSendInvoice = (invoice) => {
    if (invoice.customerEmail) {
      sendInvoice(invoice.id, invoice.customerEmail);
    } else {
      alert('Customer email is required to send invoice');
    }
  };

  const handleGenerateInvoice = () => {
    const bookingWithoutInvoice = completedBookings.find(booking => 
      !invoices.some(inv => inv.bookingId === booking.id)
    );
    
    if (bookingWithoutInvoice) {
      generateInvoiceFromBooking(bookingWithoutInvoice);
    } else {
      alert('All completed bookings already have invoices generated');
    }
  };

  const updateItemAmount = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateInvoice}
            className="btn btn-outline"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Generate from Booking
          </button>
          <button 
            onClick={() => {
              setEditingInvoice(null);
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white mr-4">
              <RevenueIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3 text-white mr-4">
              <InvoiceIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingPayments)}</p>
              <p className="text-sm text-gray-600">Pending Payments</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 text-white mr-4">
              <RevenueIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(paidInvoices)}</p>
              <p className="text-sm text-gray-600">Paid Invoices</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 text-white mr-4">
              <InvoiceIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              <p className="text-sm text-gray-600">Total Invoices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Invoice Status</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {Object.values({filterType, filterSource, filterBookingAssociation}).filter(v => v !== 'all').length} other filters active
          </span>
        </div>
        
        {/* Status Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Invoice Status Tabs">
            <button 
              onClick={() => setFilterStatus('all')} 
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                filterStatus === 'all' 
                  ? 'border-purple-500 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={filterStatus === 'all'}
            >
              All Statuses
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {invoices.length}
              </span>
            </button>
            <button 
              onClick={() => setFilterStatus('pending')} 
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                filterStatus === 'pending' 
                  ? 'border-amber-500 text-amber-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={filterStatus === 'pending'}
            >
              Pending
              <span className="ml-2 text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
                {invoices.filter(inv => inv.status === 'pending').length}
              </span>
            </button>
            <button 
              onClick={() => setFilterStatus('sent')} 
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                filterStatus === 'sent' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={filterStatus === 'sent'}
            >
              Sent
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {invoices.filter(inv => inv.status === 'sent').length}
              </span>
            </button>
            <button 
              onClick={() => setFilterStatus('paid')} 
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                filterStatus === 'paid' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={filterStatus === 'paid'}
            >
              Paid
              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {invoices.filter(inv => inv.status === 'paid').length}
              </span>
            </button>
            <button 
              onClick={() => setFilterStatus('cancelled')} 
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                filterStatus === 'cancelled' 
                  ? 'border-red-500 text-red-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={filterStatus === 'cancelled'}
            >
              Cancelled
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {invoices.filter(inv => inv.status === 'cancelled').length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Other Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">Additional Filters</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {Object.values({filterType, filterSource, filterBookingAssociation}).filter(v => v !== 'all').length} active
            </span>
          </div>
          <button
            onClick={() => {
              setFilterType('all');
              setFilterSource('all');
              setFilterBookingAssociation('all');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Additional Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="priority">Priority</option>
              <option value="outsourced">Outsourced</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Source:</label>
            <select 
              value={filterSource} 
              onChange={(e) => setFilterSource(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="internal">Internal/Bookings</option>
              <option value="outsourced">Outsourced</option>
              <option value="adhoc">Ad Hoc</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Booking Link:</label>
            <select 
              value={filterBookingAssociation} 
              onChange={(e) => setFilterBookingAssociation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Invoices</option>
              <option value="linked">Linked to Booking</option>
              <option value="unlinked">Not Linked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Invoices ({filteredInvoices.length})
          </h2>
          
          {/* Bulk Payment Actions */}
          {payableInvoices.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedInvoices.size} of {payableInvoices.length} selected
              </span>
              {selectedInvoices.size > 0 && (
                <button 
                  onClick={handleBulkPayment}
                  className="btn bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  title={`Mark ${selectedInvoices.size} invoice(s) as paid`}
                >
                  ✓ Mark {selectedInvoices.size} as Paid
                </button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {payableInvoices.length > 0 && (
                  <th className="w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={payableInvoices.length > 0 && selectedInvoices.size === payableInvoices.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      title="Select all payable invoices"
                    />
                  </th>
                )}
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Booking Reference</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => {
                const isPayable = invoice.status === 'sent' || invoice.status === 'pending';
                const isSelected = selectedInvoices.has(invoice.id);
                const booking = getBookingForInvoice(invoice);
                
                return (
                  <tr key={invoice.id} className={isSelected ? 'bg-green-50' : ''}>
                    {payableInvoices.length > 0 && (
                      <td>
                        {isPayable && (
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            checked={isSelected}
                            onChange={(e) => handleSelectInvoice(invoice.id, e.target.checked)}
                            title="Select for bulk payment"
                          />
                        )}
                      </td>
                    )}
                    <td className="font-mono text-sm font-medium">{invoice.id}</td>
                    <td className="font-medium">{invoice.customer}</td>
                    <td>
                      {booking ? (
                        <NavLink 
                          to="/schedule" 
                          className="text-blue-600 hover:text-blue-800 font-medium underline decoration-dotted hover:decoration-solid transition-all"
                          title={`View booking: ${booking.pickup} → ${booking.destination}`}
                        >
                          Booking #{booking.id}
                        </NavLink>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Ad hoc invoice</span>
                      )}
                    </td>
                    <td className="text-sm">{invoice.date}</td>
                    <td className="font-bold">{formatCurrency(invoice.amount)}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.bookingId === null ? 'bg-gray-100 text-gray-800' :
                        invoice.type === 'priority' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.bookingId === null ? 'Ad Hoc' :
                         invoice.type === 'priority' ? 'Internal' : 'Outsourced'}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button 
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                          title="View Invoice"
                        >
                          <ViewIcon className="w-3 h-3" />
                        </button>
                        {invoice.editable && (
                          <button 
                            onClick={() => handleEdit(invoice)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            title="Edit Invoice"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                        )}
                        {(invoice.status === 'pending' || invoice.status === 'sent') && (
                          <button 
                            onClick={() => handleSendInvoice(invoice)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            title="Send Invoice"
                          >
                            <SendIcon className="w-3 h-3" />
                          </button>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'pending') && (
                          <button 
                            onClick={() => handleSinglePayment(invoice.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                            title="Mark as Paid"
                          >
                            <span className="font-bold">€</span>
                          </button>
                        )}
                        <button 
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                          title="Download Invoice"
                        >
                          <DownloadIcon className="w-3 h-3" />
                        </button>
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                          <button 
                            onClick={() => cancelInvoice(invoice.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                            title="Cancel Invoice"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No invoices found matching the current filters.
            </div>
          )}
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingInvoice ? `Edit Invoice - ${editingInvoice.id}` : 'Create New Invoice'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingInvoice(null);
                  resetForm();
                }}
                className="btn btn-outline px-2 py-1"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Invoice Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customer}
                      onChange={(e) => setFormData({...formData, customer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="priority">Priority (Internal)</option>
                      <option value="outsourced">Outsourced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link to Booking (Optional)</label>
                    <select
                      value={formData.bookingId || ''}
                      onChange={(e) => {
                        const bookingId = e.target.value ? parseInt(e.target.value) : null;
                        const selectedBooking = bookings.find(b => b.id === bookingId);
                        if (selectedBooking) {
                          setFormData({
                            ...formData, 
                            bookingId,
                            customer: selectedBooking.customer,
                            customerEmail: customers.find(c => c.name === selectedBooking.customer)?.email || formData.customerEmail
                          });
                        } else {
                          setFormData({...formData, bookingId: null});
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No booking association (Ad hoc)</option>
                      {bookings.map(booking => (
                        <option key={booking.id} value={booking.id}>
                          Booking #{booking.id} - {booking.customer} ({booking.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Invoice Items</h3>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Service description"
                        value={item.description}
                        onChange={(e) => updateItemAmount(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => updateItemAmount(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Rate (€)</label>
                      <input
                        type="number"
                        placeholder="45.00"
                        value={item.rate}
                        onChange={(e) => updateItemAmount(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                      <input
                        type="text"
                        value={formatCurrency(item.amount)}
                        readOnly
                        className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded font-medium text-gray-900"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = formData.items.filter((_, i) => i !== index);
                            setFormData({...formData, items: newItems});
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Remove item"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...formData.items, { description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }];
                      setFormData({...formData, items: newItems});
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Line Item
                  </button>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      Total: {formatCurrency(formData.items.reduce((sum, item) => sum + item.amount, 0))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingInvoice(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}