export default function Outsource() {
  const partners = [
    { id: 1, name: "City Cab Co.", contact: "John Smith", phone: "555-0401", status: "active", rating: 4.5 },
    { id: 2, name: "Express Rides", contact: "Sarah Jones", phone: "555-0402", status: "active", rating: 4.2 },
    { id: 3, name: "Metro Transport", contact: "Mike Wilson", phone: "555-0403", status: "inactive", rating: 3.8 }
  ];

  const outsourcedBookings = [
    { id: 1, customer: "Alice Johnson", partner: "City Cab Co.", date: "2024-01-20", amount: 65, status: "completed" },
    { id: 2, customer: "Bob Smith", partner: "Express Rides", date: "2024-01-21", amount: 45, status: "in-progress" },
    { id: 3, customer: "Carol Brown", partner: "City Cab Co.", date: "2024-01-22", amount: 55, status: "pending" }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Outsource Partners</h1>

      {/* Partner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 text-white text-2xl mr-4">🤝</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
              <p className="text-sm text-gray-600">Total Partners</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white text-2xl mr-4">✅</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {partners.filter(p => p.status === "active").length}
              </p>
              <p className="text-sm text-gray-600">Active Partners</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 text-white text-2xl mr-4">□</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outsourcedBookings.length}</p>
              <p className="text-sm text-gray-600">Outsourced Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Partner Companies</h2>
          <button className="btn btn-primary">Add Partner</button>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td className="font-medium">{partner.name}</td>
                  <td>{partner.contact}</td>
                  <td>{partner.phone}</td>
                  <td>
                    <span className={`badge ${
                      partner.status === 'active' ? 'badge-green' : 'badge-red'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{partner.rating}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline px-2 py-1 text-xs">
                        Edit
                      </button>
                      <button className="btn btn-outline px-2 py-1 text-xs">
                        Contact
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outsourced Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Outsourced Bookings</h2>
          <button className="btn btn-primary">Outsource Booking</button>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Partner</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outsourcedBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-medium">{booking.customer}</td>
                  <td>{booking.partner}</td>
                  <td>{booking.date}</td>
                  <td className="font-bold">${booking.amount}</td>
                  <td>
                    <span className={`badge ${
                      booking.status === 'completed' ? 'badge-green' :
                      booking.status === 'in-progress' ? 'badge-blue' :
                      'badge-yellow'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline px-2 py-1 text-xs">
                        View
                      </button>
                      <button className="btn btn-outline px-2 py-1 text-xs">
                        Track
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}