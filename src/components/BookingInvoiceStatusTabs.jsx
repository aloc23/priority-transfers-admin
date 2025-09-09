import { useState } from 'react';
import BookingStatusBlock from './BookingStatusBlock';
import InvoiceStatusBlock from './InvoiceStatusBlock';

export default function BookingInvoiceStatusTabs({ compact = false }) {
  const [activeTab, setActiveTab] = useState('booking');

  const tabs = [
    { id: 'booking', label: 'Booking Status', icon: '📋' },
    { id: 'invoice', label: 'Invoice Status', icon: '💰' }
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
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
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
            showAddButtons={true}
          />
        )}
      </div>
    </div>
  );
}