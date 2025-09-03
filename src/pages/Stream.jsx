import { useState, useEffect } from "react";
import { useAppStore } from "../context/AppStore";
import { formatCurrency, calculateRevenue, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { 
  RevenueIcon, 
  StarIcon, 
  CustomerIcon, 
  BookingIcon, 
  VehicleIcon, 
  ReportsIcon, 
  ViewIcon, 
  FilterIcon, 
  DownloadIcon,
  OutsourceIcon,
  SuccessIcon,
  TrendUpIcon,
  TrendDownIcon
} from "../components/Icons";
import ReportDetailsModal from "../components/ReportDetailsModal";
import AdvancedFilters from "../components/AdvancedFilters";
import { exportToCSV, exportReportData } from "../utils/export";
import FinanceTrackerSection from "../components/FinanceTrackerSection";

export default function Stream() {
  const { bookings, customers, drivers, vehicles, invoices, expenses, income, estimations } = useAppStore();
  const [showOutsourced, setShowOutsourced] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return urlParams.get('tab') || "overview";
  });
  const [outsourcingExpanded, setOutsourcingExpanded] = useState(false);
  const [savedViews, setSavedViews] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    status: 'all',
    type: 'all',
    customer: '',
    driver: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Load saved views on component mount
  useEffect(() => {
    const savedViewsData = localStorage.getItem('reportViews');
    if (savedViewsData) {
      try {
        setSavedViews(JSON.parse(savedViewsData));
      } catch (error) {
        console.error('Failed to load saved views:', error);
      }
    }
  }, []);

  // Calculate enhanced financial metrics
  const totalRevenue = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

  // Calculate various metrics for reports
  const completedBookings = bookings.filter(b => b.status === "completed");
  const priorityBookings = bookings.filter(b => b.type === "priority");
  const outsourcedBookings = bookings.filter(b => b.type === "outsourced");
  
  const totalBookings = bookings.length;
  const completedCount = completedBookings.length;
  const completionRate = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0;
  
  const avgBookingValue = completedBookings.length > 0 
    ? calculateRevenue(bookings, "completed", invoices) / completedBookings.length 
    : 0;

  const monthlyGrowthRate = 12.3; // This would be calculated based on historical data
  const customerRetention = 85.4; // This would be calculated based on customer data
  const avgSatisfaction = 4.7; // This would come from customer feedback
  const efficiency = 92.1; // This would be calculated based on operational metrics

  // Key performance stats for the top section
  const performanceStats = [
    {
      title: "Customer Retention",
      value: `${customerRetention}%`,
      change: "+2.3%",
      color: "text-green-600"
    },
    {
      title: "Avg Booking Value", 
      value: `€${avgBookingValue.toFixed(0)}`,
      change: "+5.1%",
      color: "text-blue-600"
    },
    {
      title: "Growth Rate",
      value: `${monthlyGrowthRate}%`,
      change: "MoM",
      color: "text-purple-600"
    },
    {
      title: "Satisfaction",
      value: avgSatisfaction,
      change: "★ Rating",
      color: "text-yellow-600"
    },
    {
      title: "Efficiency",
      value: `${efficiency}%`,
      change: "+1.2%",
      color: "text-cyan-600"
    },
    {
      title: "Profit Margin",
      value: `${Math.abs(profitMargin).toFixed(1)}%`,
      change: profitMargin >= 0 ? "+3.4%" : "-3.4%",
      color: profitMargin >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  // Monthly overview stats
  const monthlyStats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      subtitle: `Priority: ${priorityBookings.length} | Outsourced: ${outsourcedBookings.length}`
    },
    {
      title: "Completed",
      value: completedCount,
      subtitle: `${completionRate.toFixed(0)}% completion rate`
    },
    {
      title: "Revenue",
      value: `€${calculateRevenue(bookings, "completed", invoices).toFixed(0)}`,
      subtitle: "From completed bookings"
    },
    {
      title: "Avg Rating",
      value: avgSatisfaction,
      subtitle: "Based on customer feedback"
    }
  ];

  // Available reports
  const availableReports = [
    {
      id: 'revenue',
      title: 'Revenue Report',
      description: 'Monthly revenue and financial analytics',
      icon: RevenueIcon,
      color: 'text-green-600'
    },
    {
      id: 'driver-performance',
      title: 'Driver Performance',
      description: 'Driver ratings and trip statistics',
      icon: StarIcon,
      color: 'text-yellow-600'
    },
    {
      id: 'customer-analytics',
      title: 'Customer Analytics',
      description: 'Customer insights and behavior patterns',
      icon: CustomerIcon,
      color: 'text-blue-600'
    },
    {
      id: 'booking-trends',
      title: 'Booking Trends',
      description: 'Daily and weekly booking patterns',
      icon: BookingIcon,
      color: 'text-purple-600'
    },
    {
      id: 'fleet-utilization',
      title: 'Fleet Utilization',
      description: 'Vehicle usage and maintenance',
      icon: VehicleIcon,
      color: 'text-slate-600'
    },
    {
      id: 'business-growth',
      title: 'Business Growth',
      description: 'Growth metrics and forecasts',
      icon: TrendUpIcon,
      color: 'text-red-600'
    }
  ];

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleExportData = () => {
    // Implementation for data export
    const reportData = {
      bookings: bookings,
      revenue: calculateRevenue(bookings, "completed", invoices),
      customers: customers.length,
      // Add more data as needed
    };
    
    exportReportData(reportData, 'stream-analytics');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Stream - Analytics & Finance</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-purple-100 text-purple-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("finance")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "finance"
                ? "bg-purple-100 text-purple-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Finance Tracker
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "reports"
                ? "bg-purple-100 text-purple-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Reports & Analytics
          </button>
          <button
            onClick={handleExportData}
            className="btn btn-outline"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Performance KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {performanceStats.map((stat, index) => (
              <div key={index} className="card p-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.title}</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendUpIcon className="w-3 h-3 mr-1 text-green-600" />
                    <span className="text-xs text-slate-500">{stat.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Overview */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Monthly Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {monthlyStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-lg text-slate-700">{stat.title}</div>
                  <div className="text-sm text-slate-500">{stat.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Finance Summary */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Financial Summary</h2>
            <FinanceTrackerSection showHeader={false} compact={true} />
          </div>
        </div>
      )}

      {activeTab === "finance" && (
        <div className="space-y-6">
          <FinanceTrackerSection showHeader={false} compact={false} />
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* Available Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableReports.map((report) => {
              const IconComponent = report.icon;
              return (
                <div
                  key={report.id}
                  className="card p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => handleViewReport(report)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${report.color} flex-shrink-0`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{report.title}</h3>
                      <p className="text-sm text-slate-600 mb-4">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="btn btn-outline">
                      <ViewIcon className="w-4 h-4 mr-2" />
                      View Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}