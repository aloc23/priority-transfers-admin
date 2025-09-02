import { useAppStore } from "../context/AppStore";
import { Link } from "react-router-dom";
import { 
  BookingIcon, 
  CustomerIcon, 
  DriverIcon, 
  VehicleIcon, 
  PlusIcon, 
  SettingsIcon,
  TrendUpIcon,
  TrendDownIcon,
  EstimationIcon,
  OutsourceIcon,
  RevenueIcon
} from "../components/Icons";

export default function Dashboard() {
  const { 
    bookings, 
    customers, 
    drivers, 
    vehicles, 
    activityHistory,
    partners,
    expenses,
    income,
    estimations
  } = useAppStore();

  // Calculate enhanced financial metrics
  const totalRevenue = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

  // Revenue breakdown
  const internalRevenue = income.filter(i => i.type === 'internal').reduce((sum, i) => sum + i.amount, 0);
  const outsourcedRevenue = income.filter(i => i.type === 'outsourced').reduce((sum, i) => sum + i.amount, 0);

  // Partner metrics
  const activePartners = partners.filter(p => p.status === 'active').length;
  const totalPartnerRevenue = partners.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);

  // Estimation metrics
  const pendingEstimations = estimations.filter(e => e.status === 'pending').length;
  const estimationValue = estimations.reduce((sum, e) => sum + e.totalPrice, 0);

  // Enhanced stats with financial data
  const enhancedStats = [
    {
      name: "Total Revenue",
      value: `€${totalRevenue.toFixed(0)}`,
      subValue: profitMargin >= 0 ? `${profitMargin.toFixed(1)}% margin` : `${Math.abs(profitMargin).toFixed(1)}% loss`,
      icon: RevenueIcon,
      color: "bg-gradient-to-r from-emerald-600 to-green-500",
      trend: profitMargin >= 0 ? 'up' : 'down'
    },
    {
      name: "Active Bookings",
      value: bookings.length,
      subValue: `${bookings.filter(b => b.status === 'completed').length} completed`,
      icon: BookingIcon,
      color: "bg-gradient-to-r from-purple-600 to-blue-500"
    },
    {
      name: "Partner Network",
      value: activePartners,
      subValue: `€${totalPartnerRevenue.toFixed(0)} revenue`,
      icon: OutsourceIcon,
      color: "bg-gradient-to-r from-indigo-600 to-purple-500"
    },
    {
      name: "Pending Quotes",
      value: pendingEstimations,
      subValue: `€${estimationValue.toFixed(0)} potential`,
      icon: EstimationIcon,
      color: "bg-gradient-to-r from-orange-600 to-pink-500"
    }
  ];

  const operationalStats = [
    {
      name: "Active Customers",
      value: customers.length,
      icon: CustomerIcon,
      color: "bg-gradient-to-r from-cyan-600 to-blue-500"
    },
    {
      name: "Available Drivers", 
      value: drivers.filter(d => d.status === "available").length,
      icon: DriverIcon,
      color: "bg-gradient-to-r from-green-600 to-emerald-500"
    },
    {
      name: "Active Vehicles",
      value: vehicles.filter(v => v.status === "active").length,
      icon: VehicleIcon,
      color: "bg-gradient-to-r from-slate-600 to-slate-700"
    }
  ];

  const recentBookings = bookings.slice(0, 5);
  const recentActivity = activityHistory.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Enhanced Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {enhancedStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 text-white flex items-center justify-center mr-4`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.name}</p>
                  {stat.subValue && (
                    <div className="flex items-center mt-1">
                      {stat.trend && (
                        <div className={`flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.trend === 'up' ? (
                            <TrendUpIcon className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendDownIcon className="w-3 h-3 mr-1" />
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-500">{stat.subValue}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Internal Revenue</span>
              <span className="font-semibold text-green-600">€{internalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Outsourced Revenue</span>
              <span className="font-semibold text-blue-600">€{outsourcedRevenue.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Total Revenue</span>
                <span className="font-bold text-slate-900">€{totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Profit Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Expenses</span>
              <span className="font-semibold text-red-600">-€{totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Net Profit</span>
              <span className={`font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{netProfit.toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Profit Margin</span>
                <span className={`font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/estimations" className="block w-full btn btn-primary text-sm">
              <EstimationIcon className="w-4 h-4 mr-2" />
              New Estimation
            </Link>
            <Link to="/schedule" className="block w-full btn btn-outline text-sm">
              <BookingIcon className="w-4 h-4 mr-2" />
              New Booking
            </Link>
            <Link to="/finance" className="block w-full btn btn-outline text-sm">
              <RevenueIcon className="w-4 h-4 mr-2" />
              Add Income/Expense
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {operationalStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 text-white flex items-center justify-center mr-4`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity and Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Recent Bookings</h2>
            <Link to="/schedule" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              View all →
            </Link>
          </div>
          
          {recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-2">Customer</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-2">Route</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-2">Date</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="py-3 text-sm font-medium text-slate-900">{booking.customer}</td>
                      <td className="py-3 text-sm text-slate-600">
                        <div>{booking.pickup}</div>
                        <div className="text-xs text-slate-400">→ {booking.destination}</div>
                      </td>
                      <td className="py-3 text-sm text-slate-600">{booking.date}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type.includes('created') ? 'bg-green-400' :
                      activity.type.includes('updated') ? 'bg-blue-400' :
                      activity.type.includes('deleted') ? 'bg-red-400' :
                      'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">{activity.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}