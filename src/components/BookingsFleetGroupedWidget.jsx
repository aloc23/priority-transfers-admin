// BookingsFleetGroupedWidget: Combined Bookings & Calendar with Fleet & Driver Status
import { useState } from 'react';
import BookingsCalendarWidget from './BookingsCalendarWidget';
import FleetDriverChecker from './FleetDriverChecker';
import { CalendarIcon, VehicleIcon } from './Icons';

export default function BookingsFleetGroupedWidget({ compact = false }) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'fleet'

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>Bookings, Calendar & Fleet Status</h3>
          {/* Book Now button moved here */}
          <BookingsCalendarWidget.BookNowButton />
        </div>
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200 ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Bookings & Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200 ${activeTab === 'fleet' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <VehicleIcon className="w-4 h-4" />
              <span>Fleet & Driver Status</span>
            </button>
          </div>
        </div>
      </div>
      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'bookings' && (
          <div className="p-0 -m-6">
            <BookingsCalendarWidget showStatusPillsInHeader={false} />
          </div>
        )}
        {activeTab === 'fleet' && (
          <div className="p-0 -m-6">
            <FleetDriverChecker compact={compact} />
          </div>
        )}
      </div>
    </div>
  );
}