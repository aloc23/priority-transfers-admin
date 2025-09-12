// BookingsFleetGroupedWidget: Combined Bookings & Calendar with Fleet & Driver Status
import { useState, useRef } from 'react';
import BookingsCalendarWidget, { BookNowButton } from './BookingsCalendarWidget';
import FleetDriverChecker from './FleetDriverChecker';
import ResourceStatusBlock from './ResourceStatusBlock';
import { CalendarIcon, VehicleIcon } from './Icons';
import { createContext } from 'react';
import moment from 'moment';

// Context for Book Now button (must match BookingsCalendarWidget)
const BookNowContext = BookingsCalendarWidget.BookNowContext || createContext({ openModal: () => {}, openModalWithDate: (date) => {} });

export default function BookingsFleetGroupedWidget({ compact = false }) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'fleet'
  const bookingsCalendarRef = useRef(null);

  // Provide context value that will be accessible to BookNowButton
  const contextValue = {
    openModal: () => {
      // Set the active tab to bookings and trigger the modal
      setActiveTab('bookings');
      // Use a small delay to ensure the calendar widget is rendered
      setTimeout(() => {
        if (window.__openBookingModal) {
          window.__openBookingModal();
        }
      }, 50);
    },
    openModalWithDate: (date) => {
      setActiveTab('bookings');
      setTimeout(() => {
        if (window.__openBookingModalWithDate) {
          window.__openBookingModalWithDate(date);
        }
      }, 50);
    }
  };

  return (
    <BookNowContext.Provider value={contextValue}>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-5">
        {/* Header Row: Tabs + Book Now button */}
        <div className="flex flex-row items-center gap-2 mb-3 flex-nowrap min-w-0">
          <div className="flex items-center space-x-1 min-w-0">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Bookings & Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'fleet' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <VehicleIcon className="w-4 h-4" />
              <span>Fleet & Driver Status</span>
            </button>
          </div>
          <div className="flex-shrink-0 ml-auto">
            <BookNowButton />
          </div>
        </div>
        {/* Tab Content */}
        <div className="min-h-[350px] md:min-h-[400px]">
          {activeTab === 'bookings' && (
            <div className="p-0 md:-m-5">
              <BookingsCalendarWidget 
                showStatusPillsInHeader={false}
              />
            </div>
          )}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              {/* Enhanced Resource Status Block */}
              <div className="-mx-4 md:-mx-5">
                <ResourceStatusBlock compact={true} />
              </div>
              
              {/* Fleet & Driver Checker */}
              <div className="-mx-4 md:-mx-5">
                <FleetDriverChecker compact={compact} />
              </div>
            </div>
          )}
        </div>
      </div>
    </BookNowContext.Provider>
  );
}