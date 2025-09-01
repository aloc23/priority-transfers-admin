import React, { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function Schedule() {
  const { bookings, drivers, customers } = useAppStore();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Generate days for current month (basic calendar)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const openBooking = (booking) => {
    setSelectedBooking(booking);
    setSelectedDate(null);
  };

  const openDate = (date) => {
    setSelectedDate(date);
    setSelectedBooking(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Schedule</h1>

      {/* Calendar Grid (Desktop) */}
      <div className="hidden md:grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-semibold">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(year, month, i + 1);
          const dayBookings = bookings.filter(
            (b) =>
              new Date(b.date).toDateString() === date.toDateString()
          );
          return (
            <div
              key={i}
              className="border rounded-lg p-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => openDate(date)}
            >
              <div className="text-sm font-medium">{i + 1}</div>
              {dayBookings.length > 0 && (
                <div className="mt-1">
                  {dayBookings.slice(0, 2).map((b) => (
                    <div
                      key={b.id}
                      className="text-xs bg-blue-500 text-white rounded px-1 mb-1 truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        openBooking(b);
                      }}
                    >
                      {customers.find((c) => c.id === b.customerId)?.name ||
                        "Booking"}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Agenda View */}
      <div className="md:hidden space-y-3">
        {bookings
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((b) => {
            const customer =
              customers.find((c) => c.id === b.customerId)?.name || "Customer";
            const driver =
              drivers.find((d) => d.id === b.driverId)?.name || "Driver";
            return (
              <div
                key={b.id}
                className="p-3 border rounded-lg shadow-sm bg-white"
                onClick={() => openBooking(b)}
              >
                <div className="font-semibold">{customer}</div>
                <div className="text-sm text-gray-600">
                  {new Date(b.date).toLocaleString()} – {driver}
                </div>
              </div>
            );
          })}
      </div>

      {/* Booking Modal */}
      {(selectedBooking || selectedDate) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            {selectedBooking ? (
              <>
                <h2 className="text-lg font-bold mb-2">Booking Details</h2>
                <p>
                  <strong>Customer: </strong>
                  {customers.find((c) => c.id === selectedBooking.customerId)
                    ?.name || "Unknown"}
                </p>
                <p>
                  <strong>Driver: </strong>
                  {drivers.find((d) => d.id === selectedBooking.driverId)
                    ?.name || "Unassigned"}
                </p>
                <p>
                  <strong>Date: </strong>
                  {new Date(selectedBooking.date).toLocaleString()}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-2">No Bookings</h2>
                <p>
                  {selectedDate.toDateString()} has no bookings scheduled.
                </p>
              </>
            )}
            <div className="mt-4 text-right">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  setSelectedBooking(null);
                  setSelectedDate(null);
                }}
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
