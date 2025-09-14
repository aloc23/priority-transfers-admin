import { useState, useEffect } from "react";
import { useAppStore } from "../context/AppStore";
import { formatCurrency, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { XIcon, PlusIcon } from "./Icons";

export default function InvoiceEditModal({ 
  show, 
  onClose, 
  editingInvoice = null,
  onSave 
}) {
  const { bookings, updateInvoice, addInvoice } = useAppStore();
  
  const [formData, setFormData] = useState({
    customer: '',
    customerEmail: '',
    amount: EURO_PRICE_PER_BOOKING,
    items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }],
    bookingId: null, // For manual booking association
    type: 'priority' // Default type
  });

  // Reset form when modal opens/closes or editingInvoice changes
  useEffect(() => {
    if (show) {
      if (editingInvoice) {
        setFormData({
          customer: editingInvoice.customer || '',
          customerEmail: editingInvoice.customerEmail || '',
          amount: editingInvoice.amount || EURO_PRICE_PER_BOOKING,
          items: editingInvoice.items || [{ description: '', quantity: 1, rate: editingInvoice.amount || EURO_PRICE_PER_BOOKING, amount: editingInvoice.amount || EURO_PRICE_PER_BOOKING }],
          bookingId: editingInvoice.bookingId || null,
          type: editingInvoice.type || 'priority'
        });
      } else {
        resetForm();
      }
    }
  }, [show, editingInvoice]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);
    
    const invoiceData = {
      ...formData,
      amount: totalAmount
    };

    // Call the onSave callback with the form data and editing state
    if (onSave) {
      onSave(invoiceData, editingInvoice);
    }
    
    // Close modal and reset form
    onClose();
    resetForm();
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }
      ]
    });
  };

  const removeLineItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {editingInvoice ? `Edit Invoice - ${editingInvoice.id}` : 'Create New Invoice'}
          </h2>
          <button
            onClick={onClose}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer@example.com"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="priority">Priority (Internal)</option>
                  <option value="outsourced">Outsourced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to Booking (Optional)</label>
                <select
                  value={formData.bookingId || ''}
                  onChange={(e) => setFormData({...formData, bookingId: e.target.value || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Service description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate (€)</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="text"
                      value={formatCurrency(item.amount)}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
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
                onClick={addLineItem}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add Line Item
              </button>
              <div className="text-lg font-semibold text-gray-900">
                Total: {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
  );
}