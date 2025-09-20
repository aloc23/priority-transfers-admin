import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { formatCurrency, calculateRevenue, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { 
  RevenueIcon, 
  IncomeIcon,
  PaidInvoiceIcon,
  InvoiceIcon, 
  ViewIcon, 
  EditIcon, 
  SendIcon, 
  DownloadIcon, 
  XIcon, 
  PlusIcon,
  FilterIcon
} from "../components/Icons";
import ToggleSwitch from "../components/ToggleSwitch";
import PageHeader from "../components/PageHeader";
import StatsCard from "../components/StatsCard";
import InvoiceStatusPills from "../components/InvoiceStatusPills";
import InvoiceTable from "../components/InvoiceTable";

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
    const customerMatch = !filterCustomer || invoice.customer.toLowerCase().includes(filterCustomer.toLowerCase());
    
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
    
    return statusMatch && typeMatch && sourceMatch && bookingMatch && customerMatch;
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

  const handleViewInvoice = (invoice) => {
    // Try to open invoice document if it exists
    if (invoice.documentUrl) {
      // Open in new tab
      window.open(invoice.documentUrl, '_blank');
    } else if (invoice.id) {
      // Generate and view invoice document
      generateInvoiceDocument(invoice);
    } else {
      // Fallback: show invoice details modal
      alert(`Invoice Details:\n\nID: ${invoice.id}\nCustomer: ${invoice.customer}\nAmount: ${formatCurrency(invoice.amount)}\nStatus: ${invoice.status}\nDate: ${invoice.date}`);
    }
  };

  const generateInvoiceDocument = (invoice) => {
    // Create a simple HTML invoice document
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin: 20px 0; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .invoice-table th { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 1.2em; text-align: right; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Priority Transfers</h1>
          <h2>Invoice #${invoice.id}</h2>
        </div>
        <div class="invoice-details">
          <p><strong>Bill To:</strong> ${invoice.customer || 'N/A'}</p>
          <p><strong>Date:</strong> ${invoice.date || new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status || 'Pending'}</p>
          ${invoice.customerEmail ? `<p><strong>Email:</strong> ${invoice.customerEmail}</p>` : ''}
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items ? invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${formatCurrency(item.amount)}</td>
              </tr>
            `).join('') : `
              <tr>
                <td>Transport Service</td>
                <td>${formatCurrency(invoice.amount)}</td>
              </tr>
            `}
          </tbody>
        </table>
        <div class="total">
          Total: ${formatCurrency(invoice.amount)}
        </div>
      </body>
      </html>
    `;

    // Open in new window
    const newWindow = window.open('', '_blank');
    newWindow.document.write(invoiceHtml);
    newWindow.document.close();
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

  const billingActions = (
    <>
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
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" actions={billingActions} />
      
      {/* KPI Cards with consistent spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg border border-green-200 p-6 text-white hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-100">Total Revenue</div>
              <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <IncomeIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">{formatCurrency(pendingPayments)}</div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <InvoiceIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Paid Invoices Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Paid</div>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(paidInvoices)}</div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <PaidInvoiceIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Unified Status Pills */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h3>
        <InvoiceStatusPills
          invoices={invoices}
          selectedStatus={filterStatus}
          onStatusChange={setFilterStatus}
        />
      </div>

      {/* Simplified Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search customer name..."
            value={filterCustomer}
            onChange={e => setFilterCustomer(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
        
        {/* Advanced filters dropdown */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="priority">Priority</option>
                  <option value="outsourced">Outsourced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={filterSource}
                  onChange={e => setFilterSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Sources</option>
                  <option value="internal">Internal</option>
                  <option value="outsourced">Outsourced</option>
                  <option value="adhoc">Ad Hoc</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Association</label>
                <select
                  value={filterBookingAssociation}
                  onChange={e => setFilterBookingAssociation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Associations</option>
                  <option value="linked">Linked to Booking</option>
                  <option value="unlinked">Unlinked</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterType('all');
                    setFilterSource('all');
                    setFilterBookingAssociation('all');
                    setFilterCustomer('');
                    setFilterDate('');
                  }}
                  className="w-full px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Invoice Table */}
      <InvoiceTable
        invoices={filteredInvoices}
        bookings={bookings}
        customers={customers}
        selectedInvoices={selectedInvoices}
        onSelectInvoice={handleSelectInvoice}
        onSelectAll={handleSelectAll}
        onViewInvoice={handleViewInvoice}
        onEditInvoice={handleEdit}
        onSendInvoice={handleSendInvoice}
        onMarkAsPaid={handleSinglePayment}
        onCancelInvoice={cancelInvoice}
        loading={isLoading}
      />

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
