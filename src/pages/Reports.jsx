import { useAppStore } from "../context/AppStore";

export default function Reports() {
  const { bookings, customers, drivers, vehicles } = useAppStore();

  const generateReport = (type) => {
    alert(`Generating ${type} report...`);
  };

  const monthlyStats = {
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === "completed").length,
    revenue: bookings.filter(b => b.status === "completed").length * 50,
    averageRating: 4.7
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Monthly Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{monthlyStats.totalBookings}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{monthlyStats.completedBookings}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">${monthlyStats.revenue}</div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{monthlyStats.averageRating}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Report Generation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Revenue Report</h3>
            <p className="text-gray-600 mb-4">Monthly revenue and financial analytics</p>
            <button 
              onClick={() => generateReport("Revenue")}
              className="btn btn-primary w-full"
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-lg font-semibold mb-2">Driver Performance</h3>
            <p className="text-gray-600 mb-4">Driver ratings and trip statistics</p>
            <button 
              onClick={() => generateReport("Driver Performance")}
              className="btn btn-primary w-full"
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">Customer Analytics</h3>
            <p className="text-gray-600 mb-4">Customer behavior and preferences</p>
            <button 
              onClick={() => generateReport("Customer Analytics")}
              className="btn btn-primary w-full"
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2">Booking Trends</h3>
            <p className="text-gray-600 mb-4">Daily and weekly booking patterns</p>
            <button 
              onClick={() => generateReport("Booking Trends")}
              className="btn btn-primary w-full"
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">🚙</div>
            <h3 className="text-lg font-semibold mb-2">Fleet Utilization</h3>
            <p className="text-gray-600 mb-4">Vehicle usage and maintenance</p>
            <button 
              onClick={() => generateReport("Fleet Utilization")}
              className="btn btn-primary w-full"
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Business Growth</h3>
            <p className="text-gray-600 mb-4">Growth metrics and forecasts</p>
            <button 
              onClick={() => generateReport("Business Growth")}
              className="btn btn-primary w-full"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
            <div className="text-sm text-gray-600">Active Customers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{drivers.length}</div>
            <div className="text-sm text-gray-600">Total Drivers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{vehicles.length}</div>
            <div className="text-sm text-gray-600">Fleet Size</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {drivers.filter(d => d.status === "available").length}
            </div>
            <div className="text-sm text-gray-600">Available Drivers</div>
          </div>
        </div>
      </div>
    </div>
  );
}