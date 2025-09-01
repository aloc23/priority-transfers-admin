import { useAppStore } from "../context/AppStore";
import { formatCurrency, calculateRevenue, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { HistoryIcon, CheckIcon, ErrorIcon, RevenueIcon } from "../components/Icons";

export default function History() {
  const { bookings } = useAppStore();

  const completedBookings = bookings.filter(booking => 
    booking.status === "completed" || booking.status === "cancelled"
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'badge-green';
      case 'cancelled': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
        <div className="flex gap-2">
          <button className="btn btn-outline">Export CSV</button>
          <button className="btn btn-outline">Filter</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
              <p className="text-sm text-gray-600">Total Historical</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <CheckIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {completedBookings.filter(b => b.status === "completed").length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <ErrorIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {completedBookings.filter(b => b.status === "cancelled").length}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <RevenueIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(calculateRevenue(completedBookings, "completed"))}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">All Historical Bookings</h2>
          <div className="flex gap-2">
            <select className="border rounded px-2 py-1 text-sm">
              <option>All Status</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm">
              <option>All Dates</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>

        {completedBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <HistoryIcon className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Historical Data</h3>
            <p className="text-gray-600">Completed and cancelled bookings will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Date & Time</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-mono text-sm">#{booking.id}</td>
                    <td className="font-medium">{booking.customer}</td>
                    <td className="text-sm text-gray-600">{booking.pickup}</td>
                    <td className="text-sm text-gray-600">{booking.destination}</td>
                    <td className="text-sm text-gray-600">
                      {booking.date} at {booking.time}
                    </td>
                    <td className="text-sm">{booking.driver}</td>
                    <td className="text-sm">{booking.vehicle}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="font-bold">
                      {booking.status === 'completed' ? formatCurrency(EURO_PRICE_PER_BOOKING) : '-'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline px-2 py-1 text-xs">
                          View
                        </button>
                        <button className="btn btn-outline px-2 py-1 text-xs">
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Revenue Chart Placeholder */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h2>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">↗</div>
          <p className="text-gray-600">Revenue chart would be displayed here</p>
          <p className="text-sm text-gray-500 mt-2">Integration with charting library needed</p>
        </div>
      </div>
    </div>
  );
}