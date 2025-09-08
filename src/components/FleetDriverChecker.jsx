import { useState } from 'react';
import { useAppStore } from '../context/AppStore';
import { useFleet } from '../context/FleetContext';

// Helper for input type="date" value formatting (YYYY-MM-DD)
function formatDateInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

// Helper for date formatting
function formatDate(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function FleetDriverChecker({ compact = false }) {
  const { bookings, drivers } = useAppStore();
  const { fleet } = useFleet();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedFleet, setExpandedFleet] = useState(null);
  const [expandedDriver, setExpandedDriver] = useState(null);

  const selectedDateStr = formatDate(selectedDate);

  // Helper to calculate unavailable hours for a booking (assume 1 hour duration)
  function getUnavailableHours(booking) {
    if (!booking.time) return null;
    const [h, m] = booking.time.split(":");
    const start = parseInt(h, 10);
    const end = start + 1; // 1 hour duration
    return `${booking.time} - ${end.toString().padStart(2, "0")}:00`;
  }

  // Fleet status: busy/unavailable if management status is not 'active', else check CONFIRMED bookings only
  const fleetStatus = fleet.map(f => {
    const bookingsForFleet = bookings.filter(b => b.vehicleId === f.id && b.date === selectedDateStr);
    const confirmedBookingsForFleet = bookingsForFleet.filter(b => b.status === 'confirmed');
    let statusLabel = 'Available';
    let statusColor = 'bg-green-100 text-green-700';
    let unavailableHours = confirmedBookingsForFleet.map(getUnavailableHours).filter(Boolean);
    
    // Manual override always takes precedence over booking status
    if (f.status && f.status !== 'active') {
      statusLabel = f.status.charAt(0).toUpperCase() + f.status.slice(1); // e.g. Maintenance, Inactive
      statusColor = 'bg-red-100 text-red-700';
      unavailableHours = ['All day'];
    } else if (confirmedBookingsForFleet.length > 0) {
      // Only show as 'Busy' if there are CONFIRMED bookings for selected date
      statusLabel = 'Busy';
      statusColor = 'bg-red-100 text-red-700';
    }
    
    return { ...f, statusLabel, statusColor, bookingsForFleet, unavailableHours, confirmedBookingsForFleet };
  });

  // Driver status: busy/offline if management status is not 'available', else check CONFIRMED bookings only
  const driverStatus = drivers.map(driver => {
    const bookingsForDriver = bookings.filter(b => b.driver === driver.name && b.date === selectedDateStr);
    const confirmedBookingsForDriver = bookingsForDriver.filter(b => b.status === 'confirmed');
    let statusLabel = 'Available';
    let statusColor = 'bg-green-100 text-green-700';
    let unavailableHours = confirmedBookingsForDriver.map(getUnavailableHours).filter(Boolean);
    
    // Manual override always takes precedence over booking status  
    if (driver.status && driver.status !== 'available') {
      statusLabel = driver.status.charAt(0).toUpperCase() + driver.status.slice(1); // e.g. Busy, Offline
      statusColor = 'bg-red-100 text-red-700';
      unavailableHours = ['All day'];
    } else if (confirmedBookingsForDriver.length > 0) {
      // Only show as 'Busy' if there are CONFIRMED bookings for selected date
      statusLabel = 'Busy';
      statusColor = 'bg-red-100 text-red-700';
    }
    
    return { ...driver, statusLabel, statusColor, bookingsForDriver, unavailableHours, confirmedBookingsForDriver };
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      {/* Header with date picker */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h3 className={`font-semibold text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>
            Fleet & Driver Status
          </h3>
          <span className="text-sm text-slate-500">
            for {formatDate(selectedDate)}
          </span>
        </div>
        <input
          type="date"
          className="input input-bordered input-sm rounded-md text-sm px-3 py-2 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={formatDateInput(selectedDate)}
          onChange={e => setSelectedDate(new Date(e.target.value))}
          aria-label="Select date to check availability"
        />
      </div>

      {/* Fleet & Driver Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fleet List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700 text-sm border-b border-slate-200 pb-2">
            Fleet ({fleetStatus.length} vehicles)
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {fleetStatus.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-4 text-slate-500 text-sm text-center">
                No vehicles found
              </div>
            ) : (
              fleetStatus.map((f, idx) => (
                <div 
                  key={f.id || idx} 
                  className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer" 
                  onClick={() => setExpandedFleet(expandedFleet === f.id ? null : f.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm truncate">
                        {f.name || f.model}
                      </div>
                      <div className="text-xs text-slate-500">
                        {f.type || "Vehicle"} • {f.plate || f.id}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${f.statusColor}`}>
                      {f.statusLabel}
                    </span>
                  </div>
                  
                  {/* Expandable Content */}
                  {expandedFleet === f.id && (
                    <div className="mt-3 text-xs text-slate-700 border-t border-slate-100 pt-3">
                      {f.statusLabel !== 'Available' ? (
                        <>
                          <div className="font-semibold text-red-700 mb-2">
                            {f.statusLabel === 'Busy' ? 'Bookings for this vehicle:' : `Status: ${f.statusLabel}`}
                          </div>
                          {f.unavailableHours.length > 0 && (
                            <div className="mb-2">
                              <span className="font-medium">Unavailable hours:</span> {f.unavailableHours.join(', ')}
                            </div>
                          )}
                          {f.confirmedBookingsForFleet.length > 0 && f.statusLabel === 'Busy' && (
                            <div className="space-y-2">
                              {f.confirmedBookingsForFleet.map((b, i) => (
                                <div key={b.id || i} className="p-2 rounded bg-red-50 border border-red-100">
                                  <div><strong>Time:</strong> {b.time}</div>
                                  <div><strong>Route:</strong> {b.pickup} → {b.destination}</div>
                                  <div><strong>Customer:</strong> {b.customer}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-green-700 mb-2">Available</div>
                          <div className="grid grid-cols-2 gap-x-4 text-xs text-slate-600">
                            <div><strong>Driver Rate:</strong> €{f.driverRate}</div>
                            <div><strong>Fuel Rate:</strong> €{f.fuelRate}</div>
                            <div><strong>Running Cost:</strong> €{f.runningCost}</div>
                            <div><strong>Capacity:</strong> {f.capacity}</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Driver List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700 text-sm border-b border-slate-200 pb-2">
            Drivers ({driverStatus.length} drivers)
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {driverStatus.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-4 text-slate-500 text-sm text-center">
                No drivers found
              </div>
            ) : (
              driverStatus.map((d, idx) => (
                <div 
                  key={d.id || idx} 
                  className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer" 
                  onClick={() => setExpandedDriver(expandedDriver === d.id ? null : d.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm truncate">
                        {d.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {d.license} • {d.phone}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.statusColor}`}>
                      {d.statusLabel}
                    </span>
                  </div>
                  
                  {/* Expandable Content */}
                  {expandedDriver === d.id && (
                    <div className="mt-3 text-xs text-slate-700 border-t border-slate-100 pt-3">
                      {d.statusLabel !== 'Available' ? (
                        <>
                          <div className="font-semibold text-red-700 mb-2">
                            {d.statusLabel === 'Busy' ? 'Bookings for this driver:' : `Status: ${d.statusLabel}`}
                          </div>
                          {d.unavailableHours.length > 0 && (
                            <div className="mb-2">
                              <span className="font-medium">Unavailable hours:</span> {d.unavailableHours.join(', ')}
                            </div>
                          )}
                          {d.confirmedBookingsForDriver.length > 0 && d.statusLabel === 'Busy' && (
                            <div className="space-y-2">
                              {d.confirmedBookingsForDriver.map((b, i) => (
                                <div key={b.id || i} className="p-2 rounded bg-red-50 border border-red-100">
                                  <div><strong>Time:</strong> {b.time}</div>
                                  <div><strong>Route:</strong> {b.pickup} → {b.destination}</div>
                                  <div><strong>Customer:</strong> {b.customer}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-green-700 mb-2">Available</div>
                          <div className="grid grid-cols-2 gap-x-4 text-xs text-slate-600">
                            <div><strong>Rating:</strong> {d.rating || 'N/A'}</div>
                            <div><strong>Phone:</strong> {d.phone}</div>
                            <div><strong>License:</strong> {d.license}</div>
                            <div><strong>Status:</strong> {d.status}</div>
                          </div>
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

      {/* Status Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Available</span>
            <span>Ready for bookings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Busy</span>
            <span>Has confirmed booking(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Offline/Maintenance</span>
            <span>Manual override</span>
          </div>
        </div>
      </div>
    </div>
  );
}