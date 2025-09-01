import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { formatCurrency, calculateRevenue, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { exportReportData, exportToCSV, exportToPDF } from "../utils/export";
import { 
  RevenueIcon, 
  StarIcon, 
  CustomerIcon, 
  BookingIcon, 
  VehicleIcon, 
  ReportsIcon, 
  ViewIcon, 
  FilterIcon, 
  DownloadIcon 
} from "../components/Icons";

export default function Reports() {
  const { bookings, customers, drivers, vehicles, invoices } = useAppStore();
  const [showOutsourced, setShowOutsourced] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const generateReport = (type, format = 'csv') => {
    let reportData = [];
    
    switch (type) {
      case 'revenue':
        reportData = bookings.map(booking => ({
          date: booking.date,
          customer: booking.customer,
          amount: EURO_PRICE_PER_BOOKING,
          type: booking.type || 'priority',
          status: booking.status
        }));
        break;
        
      case 'driver':
        reportData = drivers.map(driver => {
          const driverBookings = bookings.filter(b => b.driver === driver.name);
          return {
            driver: driver.name,
            totalBookings: driverBookings.length,
            completed: driverBookings.filter(b => b.status === 'completed').length,
            rating: driver.rating || 4.5,
            revenue: driverBookings.filter(b => b.status === 'completed').length * EURO_PRICE_PER_BOOKING
          };
        });
        break;
        
      case 'customer':
        reportData = customers.map(customer => {
          const customerBookings = bookings.filter(b => b.customer === customer.name);
          const lastBooking = customerBookings.length > 0 
            ? customerBookings[customerBookings.length - 1].date 
            : 'Never';
          return {
            customer: customer.name,
            email: customer.email,
            phone: customer.phone,
            totalBookings: customerBookings.length,
            lastBooking,
            totalSpent: customerBookings.filter(b => b.status === 'completed').length * EURO_PRICE_PER_BOOKING,
            status: customer.status || 'active'
          };
        });
        break;
        
      case 'booking':
        reportData = filteredBookings.map(booking => ({
          date: booking.date,
          time: booking.time,
          customer: booking.customer,
          pickup: booking.pickup,
          destination: booking.destination,
          driver: booking.driver,
          vehicle: booking.vehicle,
          status: booking.status,
          type: booking.type || 'priority',
          amount: EURO_PRICE_PER_BOOKING
        }));
        break;
        
      case 'fleet':
        reportData = vehicles.map(vehicle => {
          const vehicleBookings = bookings.filter(b => b.vehicle === `${vehicle.make} ${vehicle.model}`);
          return {
            vehicle: `${vehicle.make} ${vehicle.model}`,
            year: vehicle.year,
            license: vehicle.license,
            driver: vehicle.driver || 'Unassigned',
            status: vehicle.status,
            totalBookings: vehicleBookings.length,
            utilization: vehicleBookings.length > 0 ? `${vehicleBookings.length * 10}%` : '0%'
          };
        });
        break;
        
      default:
        reportData = filteredBookings;
    }
    
    if (format === 'pdf') {
      exportToPDF(reportData, `${type}-report`, `${type.charAt(0).toUpperCase() + type.slice(1)} Report`);
    } else {
      exportReportData(type, reportData);
    }
  };

  const viewReport = (type) => {
    setSelectedReport(type);
    // Instead of alert, we could show a modal with report preview
    alert(`Viewing ${type} report... (Report preview could be implemented here)`);
  };

  // Filter bookings based on selected types
  const filteredBookings = bookings.filter(booking => {
    if (!showPriority && booking.type === 'priority') return false;
    if (!showOutsourced && booking.type === 'outsourced') return false;
    return true;
  });

  const monthlyStats = {
    totalBookings: filteredBookings.length,
    completedBookings: filteredBookings.filter(b => b.status === "completed").length,
    revenue: calculateRevenue(filteredBookings, "completed"),
    priorityBookings: filteredBookings.filter(b => b.type === "priority").length,
    outsourcedBookings: filteredBookings.filter(b => b.type === "outsourced").length,
    averageRating: 4.7
  };

  const invoiceStats = {
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    pendingInvoices: invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').length,
    totalInvoiceValue: invoices.reduce((sum, inv) => sum + inv.amount, 0)
  };

  const reportTypes = [
    {
      id: 'revenue',
      title: 'Revenue Report',
      description: 'Monthly revenue and financial analytics',
      icon: RevenueIcon,
      color: 'text-green-600'
    },
    {
      id: 'driver',
      title: 'Driver Performance',
      description: 'Driver ratings and trip statistics',
      icon: StarIcon,
      color: 'text-yellow-600'
    },
    {
      id: 'customer',
      title: 'Customer Analytics',
      description: 'Customer behavior and preferences',
      icon: CustomerIcon,
      color: 'text-blue-600'
    },
    {
      id: 'booking',
      title: 'Booking Trends',
      description: 'Daily and weekly booking patterns',
      icon: BookingIcon,
      color: 'text-purple-600'
    },
    {
      id: 'fleet',
      title: 'Fleet Utilization',
      description: 'Vehicle usage and maintenance',
      icon: VehicleIcon,
      color: 'text-indigo-600'
    },
    {
      id: 'growth',
      title: 'Business Growth',
      description: 'Growth metrics and forecasts',
      icon: ReportsIcon,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center gap-4">
          <FilterIcon className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPriority}
                onChange={(e) => setShowPriority(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Priority Transfers</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOutsourced}
                onChange={(e) => setShowOutsourced(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Outsourced</span>
            </label>
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="card hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{monthlyStats.totalBookings}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-xs text-gray-500 mt-1">
              Priority: {monthlyStats.priorityBookings} | Outsourced: {monthlyStats.outsourcedBookings}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{monthlyStats.completedBookings}</div>
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-xs text-gray-500 mt-1">
              {monthlyStats.totalBookings > 0 ? Math.round((monthlyStats.completedBookings / monthlyStats.totalBookings) * 100) : 0}% completion rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(monthlyStats.revenue)}</div>
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-xs text-gray-500 mt-1">
              From completed bookings
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{monthlyStats.averageRating}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
            <div className="text-xs text-gray-500 mt-1">
              Based on customer feedback
            </div>
          </div>
        </div>
      </div>

      {/* Invoice & Revenue Stats */}
      <div className="card hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice & Payment Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{invoiceStats.totalInvoices}</div>
            <div className="text-sm text-gray-600">Total Invoices</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{invoiceStats.paidInvoices}</div>
            <div className="text-sm text-gray-600">Paid Invoices</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{invoiceStats.pendingInvoices}</div>
            <div className="text-sm text-gray-600">Pending Payment</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(invoiceStats.totalInvoiceValue)}</div>
            <div className="text-sm text-gray-600">Invoice Value</div>
          </div>
        </div>
      </div>

      {/* Report Generation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <div key={report.id} className="card hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className={`${report.color} mb-4 flex justify-center`}>
                  <IconComponent className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                <p className="text-gray-600 mb-4">{report.description}</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => viewReport(report.id)}
                    className="btn btn-outline w-full hover:shadow-sm transition-shadow"
                  >
                    <ViewIcon className="w-4 h-4 mr-2" />
                    View Report
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => generateReport(report.id, 'csv')}
                      className="btn btn-primary flex-1 hover:shadow-sm transition-shadow"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      CSV
                    </button>
                    <button 
                      onClick={() => generateReport(report.id, 'pdf')}
                      className="btn bg-red-600 text-white hover:bg-red-700 flex-1 hover:shadow-sm transition-shadow"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="card hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Statistics</h2>
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