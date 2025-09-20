// Helper for input type="date" value formatting (YYYY-MM-DD)
function formatDateInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}
import React, { useState, useMemo } from "react";
import { useAppStore } from "../context/AppStore";
import { useFleet } from "../context/FleetContext";
import { calculateKPIs } from '../utils/kpi';
import BookingModal from './BookingModal';

// Helper for date formatting
function formatDate(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Generate a week calendar bar with navigation
function getWeekDates(centerDate = new Date()) {
  const week = [];
  const start = new Date(centerDate);
  start.setDate(centerDate.getDate() - start.getDay()); // Sunday
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    week.push(d);
  }
  return week;
}

export default function SmartDashboardWidget({ onBookClick }) {
  const { bookings, income, invoices, expenses, drivers, addBooking } = useAppStore();
  const { fleet } = useFleet();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  // Move week by offset
  const weekBase = new Date(selectedDate);
  weekBase.setDate(weekBase.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(weekBase);

  // KPIs (global, not filtered by date)
  const kpis = calculateKPIs({ income, invoices, expenses });
  const totalIncomeNum = typeof kpis.totalIncome === 'number' ? kpis.totalIncome : 0;
  const paidInvoicesNum = typeof kpis.paidInvoices === 'number' ? kpis.paidInvoices : 0;
  const totalExpensesNum = typeof kpis.totalExpenses === 'number' ? kpis.totalExpenses : 0;
  const netProfitNum = typeof kpis.netProfit === 'number' ? kpis.netProfit : 0;

  // Fleet and driver status for selected date, management status overrides booking status
  const selectedDateStr = formatDate(selectedDate);
  // Helper to calculate unavailable hours for a booking (assume 1 hour duration)
  function getUnavailableHours(booking) {
    if (!booking.time) return null;
    const [h, m] = booking.time.split(":");
    const start = parseInt(h, 10);
    const end = start + 1; // 1 hour duration
    return `${booking.time} - ${end.toString().padStart(2, "0")}:00`;
  }
  // Fleet: busy/unavailable if management status is not 'active', else check CONFIRMED bookings only
  const fleetStatus = fleet.map(f => {
    const bookingsForFleet = bookings.filter(b => b.vehicleId === f.id && b.date === selectedDateStr);
    const confirmedBookingsForFleet = bookingsForFleet.filter(b => b.status === 'confirmed');
    let statusLabel = 'Available';
    let statusColor = 'bg-green-100 text-green-700';
    let unavailableHours = confirmedBookingsForFleet.map(getUnavailableHours).filter(Boolean);
    if (f.status && f.status !== 'active') {
      statusLabel = f.status.charAt(0).toUpperCase() + f.status.slice(1); // e.g. Maintenance, Inactive
      statusColor = 'bg-red-100 text-red-700';
      unavailableHours = ['All day'];
    } else if (confirmedBookingsForFleet.length > 0) {
      statusLabel = 'Busy';
      statusColor = 'bg-red-100 text-red-700';
    }
    return { ...f, statusLabel, statusColor, bookingsForFleet, unavailableHours, confirmedBookingsForFleet };
  });
  // Driver: busy/offline if management status is not 'available', else check CONFIRMED bookings only
  const driverStatus = drivers.map(driver => {
    const bookingsForDriver = bookings.filter(b => b.driver === driver.name && b.date === selectedDateStr);
    const confirmedBookingsForDriver = bookingsForDriver.filter(b => b.status === 'confirmed');
    let statusLabel = 'Available';
    let statusColor = 'bg-green-100 text-green-700';
    let unavailableHours = confirmedBookingsForDriver.map(getUnavailableHours).filter(Boolean);
    if (driver.status && driver.status !== 'available') {
      statusLabel = driver.status.charAt(0).toUpperCase() + driver.status.slice(1); // e.g. Busy, Offline
      statusColor = 'bg-red-100 text-red-700';
      unavailableHours = ['All day'];
    } else if (confirmedBookingsForDriver.length > 0) {
      statusLabel = 'Busy';
      statusColor = 'bg-red-100 text-red-700';
    }
    return { ...driver, statusLabel, statusColor, bookingsForDriver, unavailableHours, confirmedBookingsForDriver };
  });
  // Expand state for fleet/driver
  const [expandedFleet, setExpandedFleet] = useState(null);
  const [expandedDriver, setExpandedDriver] = useState(null);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Handle booking modal
  const openBookingModal = () => {
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-2xl p-0 mb-8 max-w-2xl mx-auto border border-slate-100">
      {/* Unified KPIs and Calendar */}
      <div className="flex flex-col items-stretch">
        {/* KPIs Row (global dashboard KPIs, euro) */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2 gap-3">
          <div className="flex-1 flex flex-col items-center bg-green-100 rounded-lg py-2 mx-1 shadow-sm border border-green-200 hover:bg-green-200 transition-colors duration-200">
            <span className="text-xl font-bold text-green-700 leading-tight drop-shadow">€{totalIncomeNum.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs text-green-900 tracking-wide">Total Income</span>
          </div>
          <div className="flex-1 flex flex-col items-center bg-blue-100 rounded-lg py-2 mx-1 shadow-sm border border-blue-200 hover:bg-blue-200 transition-colors duration-200">
            <span className="text-xl font-bold text-blue-700 leading-tight drop-shadow">€{paidInvoicesNum.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs text-blue-900 tracking-wide">Paid Invoices</span>
          </div>
          <div className="flex-1 flex flex-col items-center bg-red-100 rounded-lg py-2 mx-1 shadow-sm border border-red-200 hover:bg-red-200 transition-colors duration-200">
            <span className="text-xl font-bold text-red-700 leading-tight drop-shadow">€{totalExpensesNum.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs text-red-900 tracking-wide">Total Expenses</span>
          </div>
          <div className="flex-1 flex flex-col items-center bg-slate-100 rounded-lg py-2 mx-1 shadow-sm border border-slate-200 hover:bg-slate-200 transition-colors duration-200">
            <span className={`text-xl font-bold leading-tight drop-shadow ${netProfitNum >= 0 ? 'text-green-700' : 'text-red-700'}`}>€{netProfitNum.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs text-slate-900 tracking-wide">Net Profit</span>
          </div>
        </div>
        {/* Book Action Button (global booking, improved style) */}
        <div className="px-6 pb-4">
          <button
            onClick={openBookingModal}
            className="w-full group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50 overflow-hidden"
          >
            {/* Animated background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-bold tracking-wide">Book Now</span>
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </div>
          </button>
        </div>
        {/* Booking Modal */}
        <BookingModal 
          isOpen={showBookingModal}
          onClose={closeBookingModal}
          initialDate={formatDateInput(selectedDate)}
          initialTime="09:00"
        />
        {/* Scrolling Calendar Bar with week navigation, no booking label */}
        {/* Unified Fleet & Driver Status header, checker, and calendar as a card */}
        <div className="px-4 pt-2 pb-0">
          <div className="rounded-2xl shadow-lg border border-slate-200 bg-white mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4">
            <div className="flex items-center gap-3 mb-2 md:mb-0">
              <h3 className="font-semibold text-slate-800 text-base tracking-wide">Fleet & Driver Status</h3>
            </div>
            <div className="flex-1 flex items-center justify-end overflow-x-auto gap-1 scrollbar-thin scrollbar-thumb-slate-200">
              <input
                type="date"
                className="input input-bordered input-xs rounded-md text-xs px-2 py-1 mr-2"
                value={formatDateInput(selectedDate)}
                onChange={e => setSelectedDate(new Date(e.target.value))}
                aria-label="Pick date"
                style={{ minWidth: 120 }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Fleet & Driver Status - sticky header, scrollable, expandable cards side by side */}
      <div className="px-6 pb-4 pt-0">
        <div className="flex flex-row gap-4">
          {/* Fleet List */}
          <div className="flex-1 max-h-56 overflow-y-auto pr-2 custom-scrollbar space-y-1 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-700 text-xs">Fleet</span>
              <input
                type="date"
                className="input input-bordered input-xs rounded-md text-xs px-2 py-1"
                value={formatDateInput(selectedDate)}
                onChange={e => setSelectedDate(new Date(e.target.value))}
                aria-label="Pick date for fleet"
                style={{ minWidth: 110 }}
              />
            </div>
            {fleetStatus.length === 0 ? (
              <div className="bg-slate-50 rounded p-2 text-slate-500 text-xs text-center">No vehicles found</div>
            ) : (
              fleetStatus.map((f, idx) => (
                <div key={f.id || idx} className="bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer" onClick={() => setExpandedFleet(expandedFleet === f.id ? null : f.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{f.name || f.model}</div>
                      <div className="text-[11px] text-slate-500">{f.type || "Vehicle"} • {f.plate || f.id}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${f.statusColor}`}>{f.statusLabel}</span>
                  </div>
                  {expandedFleet === f.id && (
                    <div className="mt-2 text-xs text-slate-700 border-t pt-2">
                      {f.statusLabel !== 'Available' ? (
                        <>
                          <div className="font-semibold text-red-700 mb-1">{f.statusLabel === 'Busy' ? 'Bookings for this vehicle:' : `Status: ${f.statusLabel}`}</div>
                          {f.unavailableHours.length > 0 && (
                            <div className="mb-1"><b>Unavailable hours:</b> {f.unavailableHours.join(', ')}</div>
                          )}
                          {f.confirmedBookingsForFleet.length > 0 && f.statusLabel === 'Busy' && f.confirmedBookingsForFleet.map((b, i) => (
                            <div key={b.id || i} className="mb-1 p-1 rounded bg-red-50 border border-red-100">
                              <div><b>Time:</b> {b.time}</div>
                              <div><b>Route:</b> {b.pickup} → {b.destination}</div>
                              <div><b>Customer:</b> {b.customer}</div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-green-700 mb-1">Available</div>
                          <div><b>Driver Rate:</b> €{f.driverRate}</div>
                          <div><b>Fuel Rate:</b> €{f.fuelRate}</div>
                          <div><b>Running Cost:</b> €{f.runningCost}</div>
                          <div><b>Insurance Rate:</b> €{f.insuranceRate}</div>
                          <div><b>Capacity:</b> {f.capacity}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {/* Driver List */}
          <div className="flex-1 max-h-56 overflow-y-auto pr-2 custom-scrollbar space-y-1 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-700 text-xs">Drivers</span>
              <input
                type="date"
                className="input input-bordered input-xs rounded-md text-xs px-2 py-1"
                value={formatDateInput(selectedDate)}
                onChange={e => setSelectedDate(new Date(e.target.value))}
                aria-label="Pick date for drivers"
                style={{ minWidth: 110 }}
              />
            </div>
            {driverStatus.length === 0 ? (
              <div className="bg-slate-50 rounded p-2 text-slate-500 text-xs text-center">No drivers found</div>
            ) : (
              driverStatus.map((d, idx) => (
                <div key={d.id || idx} className="bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer" onClick={() => setExpandedDriver(expandedDriver === d.id ? null : d.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{d.name}</div>
                      <div className="text-[11px] text-slate-500">{d.license} • {d.phone}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${d.statusColor}`}>{d.statusLabel}</span>
                  </div>
                  {expandedDriver === d.id && (
                    <div className="mt-2 text-xs text-slate-700 border-t pt-2">
                      {d.statusLabel !== 'Available' ? (
                        <>
                          <div className="font-semibold text-red-700 mb-1">{d.statusLabel === 'Busy' ? 'Bookings for this driver:' : `Status: ${d.statusLabel}`}</div>
                          {d.unavailableHours.length > 0 && (
                            <div className="mb-1"><b>Unavailable hours:</b> {d.unavailableHours.join(', ')}</div>
                          )}
                          {d.confirmedBookingsForDriver.length > 0 && d.statusLabel === 'Busy' && d.confirmedBookingsForDriver.map((b, i) => (
                            <div key={b.id || i} className="mb-1 p-1 rounded bg-red-50 border border-red-100">
                              <div><b>Time:</b> {b.time}</div>
                              <div><b>Route:</b> {b.pickup} → {b.destination}</div>
                              <div><b>Customer:</b> {b.customer}</div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-green-700 mb-1">Available</div>
                          <div><b>Rating:</b> {d.rating || 'N/A'}</div>
                          <div><b>Status:</b> {d.status}</div>
                          <div><b>Phone:</b> {d.phone}</div>
                          <div><b>License:</b> {d.license}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
