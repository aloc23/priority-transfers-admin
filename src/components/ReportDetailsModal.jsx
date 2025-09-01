import { formatCurrency } from "../utils/currency";
import { 
  CloseIcon,
  RevenueIcon, 
  StarIcon, 
  CustomerIcon, 
  BookingIcon, 
  VehicleIcon, 
  ReportsIcon,
  DownloadIcon,
  PrintIcon
} from "./Icons";

const ReportDetailsModal = ({ report, isOpen, onClose, data }) => {
  if (!isOpen || !report) return null;

  const getReportIcon = (reportId) => {
    const icons = {
      'revenue': RevenueIcon,
      'driver': StarIcon,
      'customer': CustomerIcon,
      'booking': BookingIcon,
      'fleet': VehicleIcon,
      'growth': ReportsIcon
    };
    return icons[reportId] || ReportsIcon;
  };

  const renderReportContent = () => {
    switch (report.id) {
      case 'revenue':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Total Revenue</h4>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(data.monthlyStats.revenue)}</p>
                <p className="text-xs text-green-600 mt-1">From completed bookings</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Average Per Booking</h4>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(data.monthlyStats.completedBookings > 0 ? 
                    data.monthlyStats.revenue / data.monthlyStats.completedBookings : 0)}
                </p>
                <p className="text-xs text-blue-600 mt-1">Per completed booking</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Revenue Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Priority Transfers ({data.monthlyStats.priorityBookings} bookings)</span>
                  <span className="font-medium">{formatCurrency(data.monthlyStats.priorityBookings * 45)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outsourced ({data.monthlyStats.outsourcedBookings} bookings)</span>
                  <span className="font-medium">{formatCurrency(data.monthlyStats.outsourcedBookings * 35)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Invoice Summary</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{data.invoiceStats.totalInvoices}</div>
                  <div className="text-xs text-gray-600">Total Invoices</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{data.invoiceStats.paidInvoices}</div>
                  <div className="text-xs text-gray-600">Paid</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-600">{data.invoiceStats.pendingInvoices}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'driver':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Average Rating</h4>
                <p className="text-2xl font-bold text-yellow-900">{data.monthlyStats.averageRating}</p>
                <p className="text-xs text-yellow-600 mt-1">Across all drivers</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Completed Trips</h4>
                <p className="text-2xl font-bold text-blue-900">{data.monthlyStats.completedBookings}</p>
                <p className="text-xs text-blue-600 mt-1">This month</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Driver Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>On-time Performance</span>
                  <span className="font-medium text-green-600">95%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Customer Satisfaction</span>
                  <span className="font-medium text-green-600">4.7/5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Safety Score</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'customer':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Active Customers</h4>
                <p className="text-2xl font-bold text-blue-900">{data.customers.length}</p>
                <p className="text-xs text-blue-600 mt-1">Total registered</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Repeat Customers</h4>
                <p className="text-2xl font-bold text-green-900">{Math.round(data.customers.length * 0.65)}</p>
                <p className="text-xs text-green-600 mt-1">65% return rate</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Customer Insights</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Average Bookings per Customer</span>
                  <span className="font-medium">
                    {data.customers.length > 0 ? 
                      (data.monthlyStats.totalBookings / data.customers.length).toFixed(1) : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Customer Lifetime Value</span>
                  <span className="font-medium">{formatCurrency(450)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>New Customers This Month</span>
                  <span className="font-medium text-blue-600">{Math.round(data.customers.length * 0.15)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'booking':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Total Bookings</h4>
                <p className="text-2xl font-bold text-blue-900">{data.monthlyStats.totalBookings}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Completed</h4>
                <p className="text-2xl font-bold text-green-900">{data.monthlyStats.completedBookings}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-800 mb-2">Success Rate</h4>
                <p className="text-2xl font-bold text-purple-900">
                  {data.monthlyStats.totalBookings > 0 ? 
                    Math.round((data.monthlyStats.completedBookings / data.monthlyStats.totalBookings) * 100) : 0}%
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Booking Trends</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Priority Transfers</span>
                  <span className="font-medium text-blue-600">{data.monthlyStats.priorityBookings}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Outsourced</span>
                  <span className="font-medium text-orange-600">{data.monthlyStats.outsourcedBookings}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Peak Hours</span>
                  <span className="font-medium">8AM - 10AM, 5PM - 7PM</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fleet':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="text-sm font-medium text-indigo-800 mb-2">Fleet Size</h4>
                <p className="text-2xl font-bold text-indigo-900">{data.vehicles.length}</p>
                <p className="text-xs text-indigo-600 mt-1">Total vehicles</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Utilization Rate</h4>
                <p className="text-2xl font-bold text-green-900">78%</p>
                <p className="text-xs text-green-600 mt-1">Average daily usage</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Fleet Analytics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Average Trip Distance</span>
                  <span className="font-medium">15.2 km</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Fuel Efficiency</span>
                  <span className="font-medium text-green-600">7.8L/100km</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Maintenance Due</span>
                  <span className="font-medium text-yellow-600">3 vehicles</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'growth':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="text-sm font-medium text-red-800 mb-2">Monthly Growth</h4>
                <p className="text-2xl font-bold text-red-900">+12.5%</p>
                <p className="text-xs text-red-600 mt-1">Bookings vs last month</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Revenue Growth</h4>
                <p className="text-2xl font-bold text-green-900">+18.3%</p>
                <p className="text-xs text-green-600 mt-1">Revenue vs last month</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Growth Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Customer Acquisition</span>
                  <span className="font-medium text-green-600">+15 new customers</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Market Share</span>
                  <span className="font-medium">23.4%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Projected Monthly Revenue</span>
                  <span className="font-medium text-green-600">{formatCurrency(data.monthlyStats.revenue * 1.18)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Report details not available</p>
          </div>
        );
    }
  };

  const IconComponent = getReportIcon(report.id);

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`${report.color} p-2 rounded-lg bg-white shadow-sm`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
              <p className="text-sm text-gray-600">{report.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline px-3 py-2">
              <PrintIcon className="w-4 h-4 mr-2" />
              Print
            </button>
            <button className="btn btn-primary px-3 py-2">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export
            </button>
            <button 
              onClick={onClose}
              className="btn btn-outline px-3 py-2 ml-2"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {renderReportContent()}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <button 
            onClick={onClose}
            className="btn btn-outline"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;