import { useState } from "react";
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
    invoices, 
    updateInvoice, 
    cancelInvoice, 
    sendInvoice, 
    generateInvoiceFromBooking 
  } = useAppStore();
  
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    customer: '',
    customerEmail: '',
    amount: EURO_PRICE_PER_BOOKING,
    items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }]
  });

  const completedBookings = bookings.filter(booking => booking.status === "completed");
  const totalRevenue = calculateRevenue(bookings, "completed");
  const pendingPayments = invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);

  // Filter invoices based on status and type
  const filteredInvoices = invoices.filter(invoice => {
    const statusMatch = filterStatus === 'all' || invoice.status === filterStatus;
    const typeMatch = filterType === 'all' || invoice.type === filterType;
    return statusMatch && typeMatch;
  });

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customer: invoice.customer,
      customerEmail: invoice.customerEmail,
      amount: invoice.amount,
      items: invoice.items || [{ description: '', quantity: 1, rate: invoice.amount, amount: invoice.amount }]
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingInvoice) {
      const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);
      updateInvoice(editingInvoice.id, {
        ...formData,
        amount: totalAmount
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
      items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }]
    });
  };

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
        <button 
          onClick={handleGenerateInvoice}
          className="btn btn-primary hover:shadow-md transition-shadow"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Generate Invoice
        </button>
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

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <FilterIcon className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="priority">Priority</option>
              <option value="outsourced">Outsourced</option>
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
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Service Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-mono text-sm">{invoice.id}</td>
                  <td className="font-medium">{invoice.customer}</td>
                  <td className="text-sm">{invoice.serviceDate}</td>
                  <td className="font-bold">{formatCurrency(invoice.amount)}</td>
                  <td>
                    <span className={`badge ${
                      invoice.type === 'priority' ? 'badge-blue' : 'badge-yellow'
                    }`}>
                      {invoice.type === 'priority' ? 'Priority' : 'Outsourced'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      invoice.status === 'paid' ? 'badge-green' :
                      invoice.status === 'sent' ? 'badge-blue' :
                      invoice.status === 'cancelled' ? 'badge-red' :
                      'badge-yellow'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button 
                        className="btn btn-outline px-2 py-1 text-xs hover:shadow-sm transition-shadow"
                        title="View Invoice"
                      >
                        <ViewIcon className="w-3 h-3" />
                      </button>
                      {invoice.editable && (
                        <button 
                          onClick={() => handleEdit(invoice)}
                          className="btn btn-outline px-2 py-1 text-xs hover:shadow-sm transition-shadow"
                          title="Edit Invoice"
                        >
                          <EditIcon className="w-3 h-3" />
                        </button>
                      )}
                      {(invoice.status === 'pending' || invoice.status === 'sent') && (
                        <button 
                          onClick={() => handleSendInvoice(invoice)}
                          className="btn btn-outline px-2 py-1 text-xs hover:shadow-sm transition-shadow"
                          title="Send Invoice"
                        >
                          <SendIcon className="w-3 h-3" />
                        </button>
                      )}
                      <button 
                        className="btn btn-outline px-2 py-1 text-xs hover:shadow-sm transition-shadow"
                        title="Download Invoice"
                      >
                        <DownloadIcon className="w-3 h-3" />
                      </button>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <button 
                          onClick={() => cancelInvoice(invoice.id)}
                          className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs hover:shadow-sm transition-shadow"
                          title="Cancel Invoice"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
              <h2 className="text-xl font-bold">Edit Invoice - {editingInvoice?.id}</h2>
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Customer</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold">Invoice Items</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 mb-2 p-3 bg-gray-50 rounded">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItemAmount(index, 'description', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItemAmount(index, 'quantity', parseInt(e.target.value))}
                        className="text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateItemAmount(index, 'rate', parseFloat(e.target.value))}
                        className="text-sm"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.amount}
                        readOnly
                        className="text-sm bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="text-right mt-2">
                  <span className="text-lg font-bold">
                    Total: {formatCurrency(formData.items.reduce((sum, item) => sum + item.amount, 0))}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  Update Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingInvoice(null);
                    resetForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}