import { useState, useMemo, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppStore } from '../context/AppStore';
import { useFleet } from '../context/FleetContext';
import { useResponsive } from '../hooks/useResponsive';
import { BookingIcon, CalendarIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

// Context for Book Now button (provides openModal and openModalWithDate)
export const BookNowContext = createContext({ openModal: () => {}, openModalWithDate: (date) => {} });

export function BookNowButton() {
  const { openModal } = useContext(BookNowContext);
  return (
    <button 
      onClick={openModal}
      className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex items-center gap-2">
        <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="hidden sm:inline text-sm font-bold tracking-wide">Book Now</span>
        <span className="sm:hidden text-sm font-bold">Book</span>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      </div>
    </button>
  );
}

const localizer = momentLocalizer(moment);

export default function BookingsFleetGroupedWidget({ ...props }) {
  const { bookings, drivers, partners, invoices, updateBooking, generateInvoiceFromBooking, markInvoiceAsPaid, refreshAllData, addBooking } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [calendarView, setCalendarView] = useState('month');
  
  // Internal booking modal state management
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
    bookingType: 'internal',
    tripType: 'single',
    returnTrip: false,
    returnPickup: '',
    returnDestination: '',
    returnDate: '',
    returnTime: '',
    partnerId: ''
  });

  window.__openBookingModal = () => setShowBookingModal(true);

  const openBookingModalWithDate = (date) => {
    setBookingForm((form) => ({ ...form, date: moment(date).format('YYYY-MM-DD') }));
    setShowBookingModal(true);
  };

  const bookNowContextValue = {
    openModal: () => setShowBookingModal(true),
    openModalWithDate: (date) => {
      setBookingForm((form) => ({ ...form, date: moment(date).format('YYYY-MM-DD') }));
      setShowBookingModal(true);
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    addBooking(bookingForm);
    setShowBookingModal(false);
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
      bookingType: 'internal',
      tripType: 'single',
      returnTrip: false,
      returnPickup: '',
      returnDestination: '',
      returnDate: '',
      returnTime: '',
      partnerId: ''
    });
  };

  const getCombinedStatus = (booking) => {
    const inv = invoices.find(inv => inv.bookingId === booking.id);
    if (booking.status === 'pending') return 'Pending';
    if (booking.status === 'confirmed') return 'Confirmed';
    if (booking.status === 'completed' && !inv) return 'Completed';
    if (inv && (inv.status === 'pending' || inv.status === 'sent')) return 'Invoiced';
    if (inv && inv.status === 'paid') return 'Paid';
    if (inv && inv.status === 'overdue') return 'Overdue';
    if (booking.status === 'cancelled') return 'Cancelled';
    return 'Other';
  };

  const confirmedBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings]);
  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending'), [bookings]);

  const upcomingBookings = useMemo(() => {
    const today = moment().startOf('day');
    return bookings.filter(booking => {
      const bookingDate = moment(booking.date, 'YYYY-MM-DD');
      return bookingDate.isSameOrAfter(today) && (booking.status === 'confirmed' || booking.status === 'pending');
    });
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];
    if (selectedStatus) {
      if (selectedStatus === 'confirmed') {
        filtered = filtered.filter(b => b.status === 'confirmed');
      } else if (selectedStatus === 'pending') {
        filtered = filtered.filter(b => b.status === 'pending');
      } else if (selectedStatus === 'upcoming') {
        const today = moment().startOf('day');
        filtered = filtered.filter(b => moment(b.date, 'YYYY-MM-DD').isSameOrAfter(today) && b.status === 'confirmed');
      }
    } else if (selectedDate) {
      const selectedDateStr = moment(selectedDate).format('YYYY-MM-DD');
      filtered = filtered.filter(b => b.date === selectedDateStr);
    }
    return filtered;
  }, [bookings, selectedDate, selectedStatus]);

  const calendarEvents = useMemo(() => {
    return upcomingBookings.map(booking => {
      const startDate = moment(`${booking.date} ${booking.time || '09:00'}`, 'YYYY-MM-DD HH:mm').toDate();
      const endDate = moment(startDate).add(2, 'hours').toDate();
      return {
        id: booking.id,
        title: `${booking.customer} - ${booking.pickup}`,
        start: startDate,
        end: endDate,
        resource: booking,
        style: {
          backgroundColor: booking.status === 'confirmed' ? '#10b981' : '#f59e0b',
          borderColor: booking.status === 'confirmed' ? '#059669' : '#d97706',
          color: 'white'
        }
      };
    });
  }, [upcomingBookings]);

  const handleStatusFilter = (status) => {
    if (selectedStatus === status) {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(status);
      setSelectedDate(null);
    }
  };

  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedStatus(null);
  };

  return (
    <BookNowContext.Provider value={bookNowContextValue}>
      <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden backdrop-blur-sm relative">
        {/* Header with Book Now button */}
        <div className="p-6 pb-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookingIcon className="w-6 h-6 text-blue-600" />
              Bookings & Fleet Overview
            </h3>
            <BookNowButton />
          </div>
          
          {/* Status Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('confirmed')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedStatus === 'confirmed'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Confirmed ({confirmedBookings.length})
            </button>
            <button
              onClick={() => handleStatusFilter('pending')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedStatus === 'pending'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              Pending ({pendingBookings.length})
            </button>
            <button
              onClick={() => handleStatusFilter('upcoming')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedStatus === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Upcoming ({upcomingBookings.length})
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-6">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="h-64">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 250 }}
                view={calendarView}
                onView={setCalendarView}
                onSelectSlot={({ start }) => {
                  handleCalendarDateSelect(start);
                  bookNowContextValue.openModalWithDate(start);
                }}
                onSelectEvent={(event) => {
                  const booking = event.resource;
                  navigate('/schedule');
                }}
                selectable
                popup
              />
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-xl flex justify-center overflow-y-auto p-6 z-50">
            <div className="modal-container w-full max-w-3xl my-8 bg-white rounded-xl shadow-2xl">
              <div className="max-h-[90vh] overflow-y-auto p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">New Booking</h2>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                      <input
                        type="text"
                        value={bookingForm.customer}
                        onChange={e => setBookingForm({ ...bookingForm, customer: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                      <select
                        value={bookingForm.driver}
                        onChange={e => setBookingForm({ ...bookingForm, driver: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Driver</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label>
                    <input
                      type="text"
                      value={bookingForm.pickup}
                      onChange={e => setBookingForm({ ...bookingForm, pickup: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                    <input
                      type="text"
                      value={bookingForm.destination}
                      onChange={e => setBookingForm({ ...bookingForm, destination: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={bookingForm.time}
                        onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                      <select
                        value={bookingForm.vehicleId}
                        onChange={e => setBookingForm({ ...bookingForm, vehicleId: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Vehicle</option>
                        {fleet?.map(v => (
                          <option key={v.id} value={v.id}>{v.name || v.model}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price (€)</label>
                      <input
                        type="number"
                        value={bookingForm.price}
                        onChange={e => setBookingForm({ ...bookingForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Create Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </BookNowContext.Provider>
  );
}

// Export BookNowButton and BookNowContext for external use
BookingsFleetGroupedWidget.BookNowButton = BookNowButton;
BookingsFleetGroupedWidget.BookNowContext = BookNowContext;
