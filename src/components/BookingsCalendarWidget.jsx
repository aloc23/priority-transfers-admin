// Unified Bookings & Calendar Widget
import { useState, useMemo, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppStore } from '../context/AppStore';
import { useFleet } from '../context/FleetContext';
import { useResponsive } from '../hooks/useResponsive';
import {
  BookingIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from './Icons';

// Context for Book Now button
export const BookNowContext = createContext({
  openModal: () => {},
  openModalWithDate: (date) => {}
});

export function BookNowButton() {
  const { openModal } = useContext(BookNowContext);
  return (
    <button
      onClick={openModal}
      className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50 overflow-hidden"
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="hidden sm:inline text-sm font-bold tracking-wide">
          Book Now
        </span>
        <span className="sm:hidden text-sm font-bold">Book</span>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      </div>
    </button>
  );
}

const localizer = momentLocalizer(moment);

export default function BookingsCalendarWidget({
  showBookingModal,
  setShowBookingModal,
  bookingForm,
  setBookingForm,
  ...props
}) {
  const {
    bookings,
    drivers,
    partners,
    invoices,
    updateBooking,
    generateInvoiceFromBooking,
    markInvoiceAsPaid,
    refreshAllData,
    addBooking
  } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  // State management
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [calendarView, setCalendarView] = useState('month');

  // Expose modal open handler globally
  window.__openBookingModal = () => setShowBookingModal(true);

  // Context value for global modal control
  const bookNowContextValue = {
    openModal: () => setShowBookingModal(true),
    openModalWithDate: (date) => {
      setBookingForm((form) => ({
        ...form,
        date: moment(date).format('YYYY-MM-DD')
      }));
      setShowBookingModal(true);
    }
  };

  // Booking submit handler
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

  // Combine booking + invoice status
  const getCombinedStatus = (booking) => {
    const inv = invoices.find((inv) => inv.bookingId === booking.id);
    if (booking.status === 'pending') return 'Pending';
    if (booking.status === 'confirmed') return 'Confirmed';
    if (booking.status === 'completed' && !inv) return 'Completed';
    if (inv && (inv.status === 'pending' || inv.status === 'sent'))
      return 'Invoiced';
    if (inv && inv.status === 'paid') return 'Paid';
    if (inv && inv.status === 'overdue') return 'Overdue';
    if (booking.status === 'cancelled') return 'Cancelled';
    return 'Other';
  };

  // KPIs
  const confirmedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed'),
    [bookings]
  );
  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'pending'),
    [bookings]
  );
  const upcomingBookings = useMemo(() => {
    const today = moment().startOf('day');
    return bookings.filter((b) => {
      const d = moment(b.date, 'YYYY-MM-DD');
      return (
        d.isSameOrAfter(today) &&
        (b.status === 'confirmed' || b.status === 'pending')
      );
    });
  }, [bookings]);

  // Filter logic
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];
    if (selectedStatus) {
      if (selectedStatus === 'confirmed') {
        filtered = filtered.filter((b) => b.status === 'confirmed');
      } else if (selectedStatus === 'pending') {
        filtered = filtered.filter((b) => b.status === 'pending');
      } else if (selectedStatus === 'upcoming') {
        const today = moment().startOf('day');
        filtered = filtered.filter((b) => {
          const d = moment(b.date, 'YYYY-MM-DD');
          return d.isSameOrAfter(today) && b.status === 'confirmed';
        });
      }
    } else if (selectedDate) {
      const dStr = moment(selectedDate).format('YYYY-MM-DD');
      filtered = filtered.filter((b) => b.date === dStr);
    }
    return filtered;
  }, [bookings, selectedDate, selectedStatus]);

  // Calendar events
  const calendarEvents = useMemo(() => {
    return upcomingBookings.map((b) => {
      const startDate = moment(
        `${b.date} ${b.time || '09:00'}`,
        'YYYY-MM-DD HH:mm'
      ).toDate();
      const endDate = moment(startDate).add(2, 'hours').toDate();
      return {
        id: b.id,
        title: `${b.customer} - ${b.pickup}`,
        start: startDate,
        end: endDate,
        resource: b
      };
    });
  }, [upcomingBookings]);

  // Status pill click
  const handleStatusFilter = (status) => {
    if (selectedStatus === status) {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(status);
      setSelectedDate(null);
    }
  };

  // Calendar date select
  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedStatus(null);
  };

  // Calendar navigation
  const navigateCalendar = (direction) => {
    const newDate = moment(selectedDate || new Date());
    newDate.add(direction === 'next' ? 1 : -1, 'month');
    setSelectedDate(newDate.toDate());
  };

  // Booking actions
  const getBookingActions = (booking) => {
    const inv = invoices.find((i) => i.bookingId === booking.id);
    const actions = [];
    const refresh = () => {
      if (typeof refreshAllData === 'function') refreshAllData();
    };
    if (booking.status === 'pending') {
      actions.push({
        label: 'Confirm',
        onClick: async () => {
          await updateBooking(booking.id, { ...booking, status: 'confirmed' });
          refresh();
        }
      });
    }
    if (booking.status === 'confirmed') {
      actions.push({
        label: 'Complete',
        onClick: async () => {
          await updateBooking(booking.id, { ...booking, status: 'completed' });
          refresh();
        }
      });
    }
    if (booking.status === 'completed' && !inv) {
      actions.push({
        label: 'Generate Invoice',
        onClick: async () => {
          await generateInvoiceFromBooking(booking);
          refresh();
        }
      });
    }
    if (inv && (inv.status === 'pending' || inv.status === 'sent')) {
      actions.push({
        label: 'Mark as Paid',
        onClick: async () => {
          await markInvoiceAsPaid(inv.id);
          refresh();
        }
      });
    }
    return actions;
  };

  return (
    <BookNowContext.Provider value={bookNowContextValue}>
      <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden backdrop-blur-sm relative">
        {/* … your full JSX for KPI pills, calendar, booking list … */}
        {/* The key fix is that everything is wrapped inside this single Provider */}
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-xl flex justify-center overflow-y-auto p-6 z-50">
          {/* … your full modal JSX … */}
        </div>
      )}
    </BookNowContext.Provider>
  );
}

// ✅ Attach static props AFTER definition
BookingsCalendarWidget.BookNowButton = BookNowButton;
BookingsCalendarWidget.BookNowContext = BookNowContext;
