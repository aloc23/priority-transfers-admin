// BookingsFleetGroupedWidget: Combined Bookings & Calendar with Fleet & Driver Status
import { useState } from 'react';
import BookingsCalendarWidget, { BookNowButton } from './BookingsCalendarWidget';
import FleetDriverChecker from './FleetDriverChecker';
import { CalendarIcon, VehicleIcon } from './Icons';
import { createContext } from 'react';
import moment from 'moment';

// Context for Book Now button (must match BookingsCalendarWidget)
const BookNowContext = BookingsCalendarWidget.BookNowContext || createContext({ openModal: () => {}, openModalWithDate: (date) => {} });

export default function BookingsFleetGroupedWidget({ compact = false }) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'fleet'

  // Modal state and handlers (moved up)
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    customer: '',
    pickup: '',
    destination: '',
    date: moment().format('YYYY-MM-DD'),
    time: '09:00',
    driver: '',
    vehicleId: '',
    status: 'pending',
    type: 'priority',
    price: 45,
    // New enhanced fields
    bookingType: 'internal', // 'internal' | 'outsourced'
    tripType: 'single', // 'single' | 'tour'
    returnTrip: false,
    returnPickup: '',
    returnDestination: '',
    returnDate: '',
    returnTime: '',
    partnerId: ''
  });

  const openBookingModalDefault = () => {
    setBookingForm({
      customer: '',
      pickup: '',
      destination: '',
      date: moment().format('YYYY-MM-DD'),
      time: '09:00',
      driver: '',
      vehicleId: '',
      status: 'pending',
      type: 'priority',
      price: 45,
      // New enhanced fields
      bookingType: 'internal',
      tripType: 'single',
      returnTrip: false,
      returnPickup: '',
      returnDestination: '',
      returnDate: '',
      returnTime: '',
      partnerId: ''
    });
    setShowBookingModal(true);
  };
  const openBookingModalWithDate = (date) => {
    setBookingForm((form) => ({ ...form, date: moment(date).format('YYYY-MM-DD') }));
    setShowBookingModal(true);
  };
  const bookNowContextValue = {
    openModal: openBookingModalDefault,
    openModalWithDate: openBookingModalWithDate
  };

  return (
    <BookNowContext.Provider value={bookNowContextValue}>
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
                showBookingModal={showBookingModal}
                setShowBookingModal={setShowBookingModal}
                bookingForm={bookingForm}
                setBookingForm={setBookingForm}
              />
            </div>
          )}
          {activeTab === 'fleet' && (
            <div className="p-0 md:-m-5">
              <FleetDriverChecker compact={compact} />
            </div>
          )}
        </div>
      </div>
    </BookNowContext.Provider>
  );
}