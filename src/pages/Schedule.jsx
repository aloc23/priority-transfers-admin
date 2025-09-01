import { useState, useMemo } from "react";
import { useAppStore } from "../context/AppStore";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarIcon } from "../components/Icons";

const localizer = momentLocalizer(moment);

export default function Schedule() {
  const { bookings, customers, drivers } = useAppStore();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [view, setView] = useState("month");

  // Convert bookings into calendar events
  const events = useMemo(() => {
    return bookings.map((b) => {
      const customer =
        customers.find((c) => c.id === b.customerId)?.name || "Customer";
      const driver =
        drivers.find((d) => d.id === b.driverId)?.name || "Unassigned";
      return {
        id: b.id,
        title: `${customer} → ${driver}`,
        start: new Date(b.date),
        end: new Date(new Date(b.date).getTime() + 60 * 60 * 1000),
        resource: b,
      };
    });
  }, [bookings, customers, drivers]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
        <CalendarIcon className="w-6 h-6" /> Schedule
      </h1>

      {/* Desktop calendar */}
      <div className="hidden md:block h-[70vh] mb-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          view={view}
          onView={(v) => setView(v)}
          popup
          selectable
          onSelectEvent={(e) => setSelectedBooking(e.resource)}
        />
      </div>

      {/* Mobile agenda */}
      <div className="md:hidden space-y-3">
        {events
          .sort((a, b) => a.start - b.start)
          .map((ev) => (
            <div
              key={ev.id}
              className="p-3 border rounded-lg shadow-sm bg-white"
              onClick={() => setSelectedBooking(ev.resource)}
            >
              <div className="font-semibold">{ev.title}</div>
              <div className="text-sm text-gray-600">
                {ev.start.toLocaleString()}
              </div>
            </div>
          ))}
      </div>

      {/* Booking modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-lg font-bold mb-2">Booking Details</h2>
            <p>
              <strong>Customer:</strong>{" "}
              {customers.find((c) => c.id === selectedBooking.customerId)?.name ||
                "Unknown"}
            </p>
            <p>
              <strong>Driver:</strong>{" "}
              {drivers.find((d) => d.id === selectedBooking.driverId)?.name ||
                "Unassigned"}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedBooking.date).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {selectedBooking.status}
            </p>
            <div className="mt-4 text-right">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
