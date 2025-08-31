import { useAppStore } from "../context/AppStore";

export default function Dashboard() {
  const { bookings, customers, drivers, vehicles } = useAppStore();

  const stats = [
    {
      name: "Total Bookings",
      value: bookings.length,
      icon: "📅",
      color: "bg-blue-500"
    },
    {
      name: "Active Customers",
      value: customers.length,
      icon: "👥",
      color: "bg-green-500"
    },
    {
      name: "Available Drivers", 
      value: drivers.filter(d => d.status === "available").length,
      icon: "🚗",
      color: "bg-yellow-500"
    },
    {
      name: "Active Vehicles",
      value: vehicles.filter(v => v.status === "active").length,
      icon: "🚙",
      color: "bg-purple-500"
    }
  ];

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 text-white text-2xl mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
          <a href="/schedule" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
            View all →
          </a>
        </div>
        
        {recentBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Driver</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-medium">{booking.customer}</td>
                    <td className="text-sm text-gray-600">{booking.pickup}</td>
                    <td className="text-sm text-gray-600">{booking.destination}</td>
                    <td className="text-sm text-gray-600">
                      {booking.date} at {booking.time}
                    </td>
                    <td>
                      <span className={`badge ${
                        booking.status === 'confirmed' ? 'badge-green' :
                        booking.status === 'pending' ? 'badge-yellow' :
                        booking.status === 'completed' ? 'badge-blue' :
                        'badge-red'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{booking.driver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-semibold mb-2">New Booking</h3>
          <p className="text-gray-600 mb-4">Create a new transfer booking</p>
          <a href="/schedule" className="btn btn-primary">
            Book Now
          </a>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-lg font-semibold mb-2">Add Customer</h3>
          <p className="text-gray-600 mb-4">Register a new customer</p>
          <a href="/customers" className="btn btn-primary">
            Add Customer
          </a>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🚗</div>
          <h3 className="text-lg font-semibold mb-2">Manage Fleet</h3>
          <p className="text-gray-600 mb-4">View and manage vehicles</p>
          <a href="/fleet" className="btn btn-primary">
            View Fleet
          </a>
        </div>
      </div>
    </div>
  );
}