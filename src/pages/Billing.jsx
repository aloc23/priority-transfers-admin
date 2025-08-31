import { useAppStore } from "../context/AppStore";

export default function Billing() {
  const { bookings } = useAppStore();

  const completedBookings = bookings.filter(booking => booking.status === "completed");
  const totalRevenue = completedBookings.length * 50; // Mock pricing
  const pendingPayments = bookings.filter(booking => booking.status === "confirmed").length * 50;

  const invoices = completedBookings.map((booking, index) => ({
    id: `INV-${1000 + index}`,
    customer: booking.customer,
    date: booking.date,
    amount: 50,
    status: Math.random() > 0.3 ? "paid" : "pending"
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white text-2xl mr-4">$</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3 text-white text-2xl mr-4">⏳</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${pendingPayments}</p>
              <p className="text-sm text-gray-600">Pending Payments</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 text-white text-2xl mr-4">□</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              <p className="text-sm text-gray-600">Total Invoices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Invoices</h2>
          <button className="btn btn-primary">Generate Invoice</button>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-mono">{invoice.id}</td>
                  <td className="font-medium">{invoice.customer}</td>
                  <td>{invoice.date}</td>
                  <td className="font-bold">${invoice.amount}</td>
                  <td>
                    <span className={`badge ${
                      invoice.status === 'paid' ? 'badge-green' : 'badge-yellow'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline px-2 py-1 text-xs">
                        View
                      </button>
                      <button className="btn btn-outline px-2 py-1 text-xs">
                        Download
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