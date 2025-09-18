import { useState } from 'react';
import BookingStatusBlock from './BookingStatusBlock';
import InvoiceStatusBlock from './InvoiceStatusBlock';
import { BookingIcon, InvoiceIcon } from './Icons';

export default function BookingInvoiceStatusTabs({ compact = false, showAddButtons = false }) {
  const [activeTab, setActiveTab] = useState('booking');

  const tabs = [
    { id: 'booking', label: 'Booking Status', icon: BookingIcon },
    { id: 'invoice', label: 'Invoice Status', icon: InvoiceIcon }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      {/* Tab Headers */}
      <div className="flex items-center border-b border-slate-200 mb-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-300 ease-in-out outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-900
                ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-accent shadow-[0_0_16px_var(--tw-ring-color)] ring-2 ring-accent ring-offset-2 ring-offset-slate-900 underline underline-offset-4 decoration-accent'
                  : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50 hover:shadow-[0_0_8px_var(--tw-ring-color)] hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-slate-900'}
              `}
            >
              <span className="w-4 h-4">
                <tab.icon className="w-4 h-4" />
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'booking' && (
          <BookingStatusBlock 
            compact={compact} 
            showBookingList={true}
            hideCombinedStatus={true} // New prop to hide combined status
          />
        )}
        {activeTab === 'invoice' && (
          <InvoiceStatusBlock 
            compact={compact} 
            showInvoiceList={true} 
            showAddButtons={showAddButtons}
          />
        )}
      </div>
    </div>
  );
}