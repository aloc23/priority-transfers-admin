import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { 
  ViewIcon, 
  EditIcon, 
  SendIcon, 
  DownloadIcon, 
  XIcon 
} from './Icons';

export default function InvoiceTable({ 
  invoices = [], 
  bookings = [],
  customers = [],
  selectedInvoices = new Set(),
  onSelectInvoice = null,
  onSelectAll = null,
  onViewInvoice = null,
  onEditInvoice = null,
  onSendInvoice = null,
  onMarkAsPaid = null,
  onCancelInvoice = null,
  loading = false
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleExpandRow = (invoiceId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  // Helper function to get booking details for an invoice
  const getBookingForInvoice = (invoice) => {
    if (!invoice.bookingId) return null;
    return bookings.find(booking => booking.id === invoice.bookingId);
  };

  // Get payable invoices for bulk operations
  const payableInvoices = invoices.filter(inv => 
    inv.status === 'sent' || inv.status === 'pending'
  );

  const allPayableSelected = payableInvoices.length > 0 && 
    payableInvoices.every(inv => selectedInvoices.has(inv.id));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-2 items-center">
          <span className="font-semibold text-lg text-gray-900">Invoices</span>
          <span className="text-gray-500 text-sm">({invoices.length})</span>
        </div>
        {payableInvoices.length > 0 && selectedInvoices.size > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">
              {selectedInvoices.size} selected
            </span>
            <button
              onClick={() => {
                selectedInvoices.forEach(invoiceId => {
                  if (onMarkAsPaid) onMarkAsPaid(invoiceId);
                });
              }}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Mark as Paid
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {payableInvoices.length > 0 && (
                <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    checked={allPayableSelected}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                    title="Select all payable invoices"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking Reference
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice, index) => {
              const isSelected = selectedInvoices.has(invoice.id);
              const booking = getBookingForInvoice(invoice);
              const isPayable = invoice.status === 'sent' || invoice.status === 'pending';
              const expanded = expandedRows.has(invoice.id);
              const isEvenRow = index % 2 === 0;

              return (
                <React.Fragment key={invoice.id}>
                  <tr className={`
                    ${isSelected ? 'bg-green-50' : isEvenRow ? 'bg-white' : 'bg-gray-50'}
                    hover:bg-blue-50 transition-colors duration-150
                  `}>
                    {payableInvoices.length > 0 && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isPayable && (
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            checked={isSelected}
                            onChange={(e) => onSelectInvoice && onSelectInvoice(invoice.id, e.target.checked)}
                            title="Select for bulk payment"
                          />
                        )}
                      </td>
                    )}
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-900">
                      {invoice.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                      {invoice.customer}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.bookingId === null ? 'bg-gray-100 text-gray-800' :
                        invoice.type === 'priority' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.bookingId === null ? 'Ad Hoc' :
                         invoice.type === 'priority' ? 'Internal' : 'Outsourced'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => onViewInvoice && onViewInvoice(invoice)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                          title="View Invoice"
                        >
                          <ViewIcon className="w-3 h-3" />
                        </button>
                        {invoice.editable && (
                          <button 
                            onClick={() => onEditInvoice && onEditInvoice(invoice)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            title="Edit Invoice"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                        )}
                        {(invoice.status === 'pending' || invoice.status === 'sent') && (
                          <button 
                            onClick={() => onSendInvoice && onSendInvoice(invoice)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            title="Send Invoice"
                          >
                            <SendIcon className="w-3 h-3" />
                          </button>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'pending') && (
                          <button 
                            onClick={() => onMarkAsPaid && onMarkAsPaid(invoice.id)}
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
                            onClick={() => onCancelInvoice && onCancelInvoice(invoice.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                            title="Cancel Invoice"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        onClick={() => toggleExpandRow(invoice.id)}
                        title={expanded ? 'Hide details' : 'Show details'}
                      >
                        {expanded ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="bg-blue-50">
                      <td colSpan={payableInvoices.length > 0 ? 10 : 9} className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-semibold mb-2 text-gray-900">Invoice Details</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="font-medium text-gray-700 mb-1">Items:</div>
                              <ul className="list-disc list-inside text-gray-600 space-y-1">
                                {invoice.items && invoice.items.length > 0 ? 
                                  invoice.items.map((item, idx) => (
                                    <li key={idx} className="text-sm">
                                      {item.description} — Qty: {item.quantity}, Rate: {formatCurrency(item.rate)}, Amount: {formatCurrency(item.amount)}
                                    </li>
                                  )) : 
                                  <li className="text-sm text-gray-500">No detailed items available</li>
                                }
                              </ul>
                            </div>
                            <div>
                              <div className="font-medium text-gray-700 mb-1">Customer Details:</div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div><span className="font-medium">Name:</span> {invoice.customer}</div>
                                {invoice.customerEmail && (
                                  <div><span className="font-medium">Email:</span> {invoice.customerEmail}</div>
                                )}
                                <div><span className="font-medium">Type:</span> {invoice.type || 'priority'}</div>
                                {booking && (
                                  <div><span className="font-medium">Route:</span> {booking.pickup} → {booking.destination}</div>
                                )}
                              </div>
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
        
        {invoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm">No invoices match the current filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}