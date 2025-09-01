import React, { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { 
  CustomerIcon, 
  PlusIcon, 
  EditIcon, 
  DeleteIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ViewIcon, 
  SendIcon,
  InvoiceIcon,
  BookingIcon
} from "../components/Icons";
import { formatCurrency } from "../utils/currency";

export default function Customers() {
  const { 
    customers, 
    bookings, 
    invoices, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    resendInvoice 
  } = useAppStore();
  
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: "", email: "", phone: "" });
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id);
    }
  };

  const toggleExpanded = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const getCustomerBookings = (customerName) => {
    return bookings.filter(booking => booking.customer === customerName);
  };

  const getCustomerInvoices = (customerName) => {
    return invoices.filter(invoice => invoice.customer === customerName);
  };

  const getCustomerStats = (customerName) => {
    const customerBookings = getCustomerBookings(customerName);
    const customerInvoices = getCustomerInvoices(customerName);
    
    return {
      totalBookings: customerBookings.length,
      completedBookings: customerBookings.filter(b => b.status === 'completed').length,
      totalRevenue: customerInvoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.amount : 0), 0),
      pendingInvoices: customerInvoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').length
    };
  };

  const handleResendInvoice = (invoiceId) => {
    const result = resendInvoice(invoiceId);
    if (result.success) {
      alert('Invoice sent successfully!');
    } else {
      alert('Failed to send invoice: ' + result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary hover:shadow-md transition-shadow"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Contact</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const stats = getCustomerStats(customer.name);
                const isExpanded = expandedCustomer === customer.id;
                const customerBookings = getCustomerBookings(customer.name);
                const customerInvoices = getCustomerInvoices(customer.name);
                
                return (
                  <React.Fragment key={customer.id}>
                    <tr className="hover:bg-gray-50">
                      <td>
                        <div className="flex items-center">
                          <div className="bg-blue-500 rounded-lg p-2 text-white mr-3">
                            <CustomerIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">ID: #{customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium">{customer.email}</div>
                          <div className="text-gray-500">{customer.phone}</div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <span className="font-medium">{stats.totalBookings}</span> total
                          <br />
                          <span className="text-green-600">{stats.completedBookings}</span> completed
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium">{formatCurrency(stats.totalRevenue)}</div>
                          <div className="text-yellow-600">{stats.pendingInvoices} pending</div>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleExpanded(customer.id)}
                            className="btn btn-outline px-2 py-1 text-xs hover:shadow-sm transition-shadow"
                            title={isExpanded ? "Hide Details" : "Show Details"}
                          >
                            {isExpanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="btn btn-outline px-2 py-1 text-xs hover:shadow-sm transition-shadow"
                            title="Edit Customer"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs hover:shadow-sm transition-shadow"
                            title="Delete Customer"
                          >
                            <DeleteIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="5" className="bg-gray-50 p-0">
                          <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              
                              {/* Booking History */}
                              <div>
                                <div className="flex items-center mb-3">
                                  <BookingIcon className="w-4 h-4 mr-2 text-blue-600" />
                                  <h4 className="font-semibold text-gray-900">Booking History</h4>
                                </div>
                                
                                {customerBookings.length === 0 ? (
                                  <p className="text-gray-500 text-sm">No bookings found</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {customerBookings.slice(0, 5).map((booking) => (
                                      <div key={booking.id} className="bg-white p-3 rounded border text-sm">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-medium">{booking.pickup} → {booking.destination}</div>
                                            <div className="text-gray-500">{booking.date} at {booking.time}</div>
                                            <div className="text-gray-500">Driver: {booking.driver}</div>
                                          </div>
                                          <span className={`badge text-xs ${
                                            booking.status === 'completed' ? 'badge-green' :
                                            booking.status === 'confirmed' ? 'badge-blue' :
                                            booking.status === 'pending' ? 'badge-yellow' :
                                            'badge-red'
                                          }`}>
                                            {booking.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                    {customerBookings.length > 5 && (
                                      <p className="text-xs text-gray-500 text-center">
                                        +{customerBookings.length - 5} more bookings
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Invoice History */}
                              <div>
                                <div className="flex items-center mb-3">
                                  <InvoiceIcon className="w-4 h-4 mr-2 text-green-600" />
                                  <h4 className="font-semibold text-gray-900">Invoice History</h4>
                                </div>
                                
                                {customerInvoices.length === 0 ? (
                                  <p className="text-gray-500 text-sm">No invoices found</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {customerInvoices.map((invoice) => (
                                      <div key={invoice.id} className="bg-white p-3 rounded border text-sm">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-medium font-mono text-xs">{invoice.id}</div>
                                            <div className="text-gray-900 font-medium">{formatCurrency(invoice.amount)}</div>
                                            <div className="text-gray-500">Service: {invoice.serviceDate}</div>
                                          </div>
                                          <div className="flex flex-col items-end gap-1">
                                            <span className={`badge text-xs ${
                                              invoice.status === 'paid' ? 'badge-green' :
                                              invoice.status === 'sent' ? 'badge-blue' :
                                              invoice.status === 'cancelled' ? 'badge-red' :
                                              'badge-yellow'
                                            }`}>
                                              {invoice.status}
                                            </span>
                                            {(invoice.status === 'pending' || invoice.status === 'sent') && (
                                              <button
                                                onClick={() => handleResendInvoice(invoice.id)}
                                                className="btn btn-outline px-1 py-0.5 text-xs hover:shadow-sm transition-shadow"
                                                title="Resend Invoice"
                                              >
                                                <SendIcon className="w-3 h-3 mr-1" />
                                                Resend
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="text-xl font-bold mb-4">
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? "Update" : "Add"} Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
                    setFormData({ name: "", email: "", phone: "" });
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