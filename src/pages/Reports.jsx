import { useState, useEffect } from "react";
import { useAppStore } from "../context/AppStore";
import { useFleet } from "../context/FleetContext";
import { formatCurrency, calculateRevenue, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { calculateKPIs } from '../utils/kpi';
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
  TrendDownIcon,
  CloseIcon
} from "../components/Icons";
import ReportDetailsModal from "../components/ReportDetailsModal";
import AdvancedFilters from "../components/AdvancedFilters";
import { exportToCSV, exportToExcel, exportToPDF, exportReportData } from "../utils/export";

// Helper to format numbers to 1 decimal, but remove trailing .0
function removeTrailingZero(val) {
  if (typeof val !== 'number') return val;
  const fixed = val.toFixed(1);
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
}

export default function Reports() {
  const { income, expenses, invoices, bookings, customers, drivers, refreshAllData } = useAppStore();
  const { fleet } = useFleet();
  const [showOutsourced, setShowOutsourced] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
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
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(false);

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

  const viewReport = (reportType) => {
    const report = reportTypes.find(r => r.title === reportType);
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  // Filter bookings based on advanced filters
  const filteredBookings = bookings.filter(booking => {
    // Basic type filters
    if (!showPriority && booking.type === 'priority') return false;
    if (!showOutsourced && booking.type === 'outsourced') return false;
    
    // Advanced filters
    if (filters.status !== 'all' && booking.status !== filters.status) return false;
    if (filters.type !== 'all' && booking.type !== filters.type) return false;
    
    // Date range filter
    if (filters.dateRange?.start && booking.date < filters.dateRange.start) return false;
    if (filters.dateRange?.end && booking.date > filters.dateRange.end) return false;
    
    // Customer filter
    if (filters.customer && !booking.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false;
    
    // Driver filter
    if (filters.driver && !booking.driver.toLowerCase().includes(filters.driver.toLowerCase())) return false;
    
    // Amount filters
    const amount = booking.amount || EURO_PRICE_PER_BOOKING;
    if (filters.minAmount && amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) return false;
    
    return true;
  }).sort((a, b) => {
    // Apply sorting
    let aVal = a[filters.sortBy];
    let bVal = b[filters.sortBy];
    
    if (filters.sortBy === 'amount') {
      aVal = a.amount || EURO_PRICE_PER_BOOKING;
      bVal = b.amount || EURO_PRICE_PER_BOOKING;
    }
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (filters.sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleExport = async (format) => {
    try {
      let exportData = filteredBookings.map(booking => ({
        Date: booking.date,
        Customer: booking.customer,
        Pickup: booking.pickup,
        Destination: booking.destination,
        Driver: booking.driver,
        Vehicle: booking.vehicle,
        Status: booking.status,
        Type: booking.type,
        Amount: formatCurrency(booking.amount || EURO_PRICE_PER_BOOKING)
      }));

      if (format === 'CSV') {
        await exportToCSV(exportData, `bookings-report-${new Date().toISOString().split('T')[0]}`);
      } else if (format === 'PDF') {
        await exportToPDF(exportData, `bookings-report-${new Date().toISOString().split('T')[0]}`, 'Bookings Report');
      } else if (format === 'Excel') {
        await exportToExcel(exportData, `bookings-report-${new Date().toISOString().split('T')[0]}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportReport = async (reportType, format) => {
    setIsExporting(true);
    setExportSuccess(false);
    setExportError(false);
    
    try {
      let exportData = [];
      
      switch (reportType) {
        case 'revenue':
          exportData = bookings.map(booking => ({
            Date: booking.date,
            Customer: booking.customer,
            Amount: formatCurrency(booking.amount || EURO_PRICE_PER_BOOKING),
            Status: booking.status,
            Type: booking.type
          }));
          break;
          
        case 'customer':
          exportData = customers.map(customer => ({
            Name: customer.name,
            Email: customer.email,
            Phone: customer.phone,
            TotalBookings: customer.totalBookings || 0,
            LastBooking: customer.lastBooking || 'N/A',
            Status: customer.status || 'active'
          }));
          break;
          
        case 'driver':
          exportData = drivers.map(driver => ({
            Name: driver.name,
            Email: driver.email,
            Phone: driver.phone,
            Status: driver.status,
            Rating: driver.rating || 'N/A',
            TotalTrips: driver.totalTrips || 0
          }));
          break;
          
        case 'fleet':
          exportData = fleet?.map(vehicle => ({
            ID: vehicle.id,
            Name: vehicle.name,
            Type: vehicle.type,
            Capacity: vehicle.capacity,
            DriverRate: vehicle.driverRate,
            FuelRate: vehicle.fuelRate,
            RunningCost: vehicle.runningCost,
            InsuranceRate: vehicle.insuranceRate
          })) || [];
          break;
          
        case 'financial':
          exportData = invoices.map(invoice => ({
            Date: invoice.date,
            Customer: invoice.customer,
            Amount: formatCurrency(invoice.amount),
            Status: invoice.status,
            Type: invoice.type || 'Standard'
          }));
          break;
          
        case 'growth':
          exportData = [
            { Metric: 'Customer Retention', Value: `${enhancedKPIs.customerRetention}%` },
            { Metric: 'Average Booking Value', Value: formatCurrency(enhancedKPIs.averageBookingValue) },
            { Metric: 'Growth Rate', Value: `${enhancedKPIs.growthRate}%` },
            { Metric: 'Customer Satisfaction', Value: enhancedKPIs.customerSatisfaction },
            { Metric: 'Operational Efficiency', Value: `${enhancedKPIs.operationalEfficiency}%` },
            { Metric: 'Profit Margin', Value: `${enhancedKPIs.profitMargin}%` }
          ];
          break;
          
        default:
          exportData = filteredBookings.map(booking => ({
            Date: booking.date,
            Customer: booking.customer,
            Route: `${booking.pickup} → ${booking.destination}`,
            Status: booking.status,
            Amount: formatCurrency(booking.amount || EURO_PRICE_PER_BOOKING)
          }));
      }

      const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        await exportToCSV(exportData, filename);
      } else if (format === 'pdf') {
        await exportToPDF(exportData, filename, `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`);
      } else if (format === 'excel') {
        await exportToExcel(exportData, filename);
      }
      
      setExportSuccess(true);
      alert(`${reportType} report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(true);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveView = (view) => {
    const updatedViews = [...savedViews, view];
    setSavedViews(updatedViews);
    localStorage.setItem('reportViews', JSON.stringify(updatedViews));
  };

  const handleLoadView = (viewName) => {
    const view = savedViews.find(v => v.name === viewName);
    if (view) {
      setFilters(view.filters);
    }
  };

  const monthlyStats = {
    totalBookings: filteredBookings.length,
    completedBookings: filteredBookings.filter(b => b.status === "completed").length,
    revenue: calculateRevenue(filteredBookings, "completed", invoices),
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

  // Live KPIs using real data and shared logic
  const kpis = calculateKPIs({ income, invoices, expenses });

  // Calculate additional KPIs for Reports page
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === "completed").length;
  const repeatCustomers = customers.filter(c => c.totalBookings > 1).length;
  const customerRetention = customers.length > 0 ? (repeatCustomers / customers.length) * 100 : 0;
  const averageBookingValue = totalBookings > 0 ? bookings.reduce((sum, b) => sum + (b.amount || 0), 0) / totalBookings : 0;
  // Placeholder for growthRate, operationalEfficiency, profitMargin, customerSatisfaction (can be improved with more data)
  const growthRate = 0; // TODO: implement MoM growth calculation
  const operationalEfficiency = completedBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
  const profitMargin = kpis.totalIncome > 0 ? ((kpis.netProfit / kpis.totalIncome) * 100) : 0;
  const customerSatisfaction = bookings.length > 0 && bookings.some(b => b.rating) ? (bookings.filter(b => b.rating).reduce((sum, b) => sum + b.rating, 0) / bookings.filter(b => b.rating).length) : 0;

  const enhancedKPIs = {
    customerRetention,
    averageBookingValue,
    growthRate,
    customerSatisfaction,
    operationalEfficiency,
    profitMargin,
    repeatCustomers,
    peakHours: "9:00-11:00 AM, 5:00-7:00 PM" // TODO: make dynamic if needed
  };

  // Outsourcing partners data
  const outsourcingPartners = [
    { id: 1, name: "City Cab Co.", contact: "John Smith", phone: "555-0401", status: "active", rating: 4.5, completedBookings: 23, revenue: 1250 },
    { id: 2, name: "Express Rides", contact: "Sarah Jones", phone: "555-0402", status: "active", rating: 4.2, completedBookings: 18, revenue: 980 },
    { id: 3, name: "Metro Transport", contact: "Mike Wilson", phone: "555-0403", status: "inactive", rating: 3.8, completedBookings: 8, revenue: 420 }
  ];

  const outsourcedBookings = [
    { id: 1, customer: "Alice Johnson", partner: "City Cab Co.", date: "2024-01-20", amount: 65, status: "completed" },
    { id: 2, customer: "Bob Smith", partner: "Express Rides", date: "2024-01-21", amount: 45, status: "in-progress" },
    { id: 3, customer: "Carol Brown", partner: "City Cab Co.", date: "2024-01-22", amount: 55, status: "pending" }
  ];

  const outsourcingStats = {
    totalPartners: outsourcingPartners.length,
    activePartners: outsourcingPartners.filter(p => p.status === "active").length,
    totalOutsourcedRevenue: outsourcingPartners.reduce((sum, p) => sum + p.revenue, 0),
    averagePartnerRating: outsourcingPartners.reduce((sum, p) => sum + p.rating, 0) / outsourcingPartners.length
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
      description: 'Customer insights and behavior patterns',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <button className="btn btn-primary" onClick={refreshAllData}>
          Refresh Data
        </button>
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-outline"}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("consolidated")}
            className={`btn ${activeTab === "consolidated" ? "btn-primary" : "btn-outline"}`}
          >
            History & Outsourcing
          </button>
          <button 
            onClick={() => setActiveTab("export")}
            className={`btn ${activeTab === "export" ? "btn-primary" : "btn-outline"}`}
          >
            <DownloadIcon className="w-4 h-4 inline mr-1" />
            Export
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Enhanced KPI Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* KPI Card Helper */}
            {[
              {
                value: typeof enhancedKPIs.customerRetention === 'number' ? removeTrailingZero(enhancedKPIs.customerRetention) + '%' : '—',
                label: 'Customer Retention',
                color: 'text-emerald-600',
                trend: '+2.3%',
                trendColor: 'text-emerald-500',
                icon: <TrendUpIcon className="w-3 h-3 text-emerald-500 mr-1" />
              },
              {
                value: typeof enhancedKPIs.averageBookingValue === 'number' ? formatCurrency(enhancedKPIs.averageBookingValue, 1) : '—',
                label: 'Avg Booking Value',
                color: 'text-purple-600',
                trend: '+5.1%',
                trendColor: 'text-emerald-500',
                icon: <TrendUpIcon className="w-3 h-3 text-emerald-500 mr-1" />
              },
              {
                value: typeof enhancedKPIs.growthRate === 'number' ? removeTrailingZero(enhancedKPIs.growthRate) + '%' : '—',
                label: 'Growth Rate',
                color: 'text-blue-600',
                trend: 'MoM',
                trendColor: 'text-emerald-500',
                icon: <TrendUpIcon className="w-3 h-3 text-emerald-500 mr-1" />
              },
              {
                value: typeof enhancedKPIs.customerSatisfaction === 'number' ? removeTrailingZero(enhancedKPIs.customerSatisfaction) : '—',
                label: 'Satisfaction',
                color: 'text-amber-600',
                trend: 'Rating',
                trendColor: 'text-slate-500',
                icon: <StarIcon className="w-3 h-3 text-amber-500 mr-1" />
              },
              {
                value: typeof enhancedKPIs.operationalEfficiency === 'number' ? removeTrailingZero(enhancedKPIs.operationalEfficiency) + '%' : '—',
                label: 'Efficiency',
                color: 'text-cyan-600',
                trend: '+1.2%',
                trendColor: 'text-emerald-500',
                icon: <TrendUpIcon className="w-3 h-3 text-emerald-500 mr-1" />
              },
              {
                value: typeof enhancedKPIs.profitMargin === 'number' ? removeTrailingZero(enhancedKPIs.profitMargin) + '%' : '—',
                label: 'Profit Margin',
                color: 'text-green-600',
                trend: '+3.4%',
                trendColor: 'text-emerald-500',
                icon: <TrendUpIcon className="w-3 h-3 text-emerald-500 mr-1" />
              }
            ].map((kpi, idx) => (
              <div key={kpi.label} className="card p-4 flex flex-col justify-between min-h-[110px]">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-xs text-slate-600">{kpi.label}</div>
                  <div className="flex items-center justify-center mt-1">
                    {kpi.icon}
                    <span className={`text-xs ${kpi.trendColor}`}>{kpi.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Overview */}
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Monthly Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{monthlyStats.totalBookings}</div>
                <div className="text-sm text-slate-600">Total Bookings</div>
                <div className="text-xs text-slate-500 mt-1">
                  Priority: {monthlyStats.priorityBookings} | Outsourced: {monthlyStats.outsourcedBookings}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{monthlyStats.completedBookings}</div>
                <div className="text-sm text-slate-600">Completed</div>
                <div className="text-xs text-slate-500 mt-1">
                  {monthlyStats.totalBookings > 0 ? removeTrailingZero((monthlyStats.completedBookings / monthlyStats.totalBookings) * 100) : '0'}% completion rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{typeof monthlyStats.revenue === 'number' ? formatCurrency(monthlyStats.revenue, 1) : '—'}</div>
                <div className="text-sm text-slate-600">Revenue</div>
                <div className="text-xs text-slate-500 mt-1">
                  From completed bookings
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{typeof monthlyStats.averageRating === 'number' ? removeTrailingZero(monthlyStats.averageRating) : '—'}</div>
                <div className="text-sm text-slate-600">Avg Rating</div>
                <div className="text-xs text-slate-500 mt-1">
                  Based on customer feedback
                </div>
              </div>
            </div>
          </div>

          {/* Report Types Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <div key={report.id} className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer p-4 flex flex-col justify-between"
                     onClick={() => viewReport(report.title)}>
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${report.color} bg-opacity-10 mr-4`}>
                      <IconComponent className={`w-6 h-6 ${report.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{report.title}</h3>
                      <p className="text-sm text-slate-600">{report.description}</p>
                    </div>
                  </div>
                  <button className="btn btn-outline w-full mt-auto">
                    <ViewIcon className="w-4 h-4 mr-2" />
                    View Report
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "consolidated" && (
        <div className="space-y-6">
          {/* Advanced Filters */}
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
            onSaveView={handleSaveView}
            onLoadView={handleLoadView}
            savedViews={savedViews}
            exportFormats={['CSV', 'PDF', 'Excel']}
          />

          {/* Outsourcing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-500 rounded-lg p-3 text-white mr-4">
                  <OutsourceIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{outsourcingStats.totalPartners}</p>
                  <p className="text-sm text-slate-600">Total Partners</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-lg p-3 text-white mr-4">
                  <SuccessIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{outsourcingStats.activePartners}</p>
                  <p className="text-sm text-slate-600">Active Partners</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-orange-600 to-pink-500 rounded-lg p-3 text-white mr-4">
                  <RevenueIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(outsourcingStats.totalOutsourcedRevenue)}</p>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-3 text-white mr-4">
                  <StarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{outsourcingStats.averagePartnerRating.toFixed(1)}</p>
                  <p className="text-sm text-slate-600">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Booking History & Analytics ({filteredBookings.length} results)
            </h2>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showPriority}
                    onChange={(e) => setShowPriority(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Priority Transfers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showOutsourced}
                    onChange={(e) => setShowOutsourced(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Outsourced</span>
                </label>
              </div>
              <button
                className="btn btn-outline text-xs ml-auto"
                onClick={() => setFilters({
                  dateRange: { start: '', end: '' },
                  status: 'all',
                  type: 'all',
                  customer: '',
                  driver: '',
                  minAmount: '',
                  maxAmount: '',
                  sortBy: 'date',
                  sortOrder: 'desc'
                })}
              >
                Clear Filters
              </button>
            </div>

            {/* History Table */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Route</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Revenue</th>
                    <th>Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.date}</td>
                      <td className="font-medium">{booking.customer}</td>
                      <td className="text-sm text-slate-600">
                        {booking.pickup} → {booking.destination}
                      </td>
                      <td>
                        <span className={`badge ${
                          booking.type === 'priority' ? 'badge-blue' : 'badge-purple'
                        }`}>
                          {booking.type === 'priority' ? 'Priority' : 'Outsourced'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          booking.status === 'completed' ? 'badge-green' :
                          booking.status === 'confirmed' ? 'badge-blue' :
                          booking.status === 'in-progress' ? 'badge-cyan' :
                          'badge-yellow'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="font-bold">{formatCurrency(booking.amount || EURO_PRICE_PER_BOOKING)}</td>
                      <td className="text-sm text-slate-600">{booking.driver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredBookings.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <ReportsIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No bookings found matching the current filters.</p>
                  <p className="text-sm">Try clearing filters or refreshing data.</p>
                </div>
              )}
            </div>
          </div>

          {/* Outsourcing Partners */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Outsourcing Partners</h2>
              <button 
                onClick={() => setOutsourcingExpanded(!outsourcingExpanded)}
                className="btn btn-outline"
              >
                {outsourcingExpanded ? 'Collapse' : 'Expand'} Details
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Rating</th>
                    {outsourcingExpanded && (
                      <>
                        <th>Completed Bookings</th>
                        <th>Revenue</th>
                      </>
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outsourcingPartners.map((partner) => (
                    <tr key={partner.id}>
                      <td className="font-medium">{partner.name}</td>
                      <td>
                        <div className="text-sm">
                          <div>{partner.contact}</div>
                          <div className="text-slate-500">{partner.phone}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          partner.status === 'active' ? 'badge-green' : 'badge-gray'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                          {partner.rating}
                        </div>
                      </td>
                      {outsourcingExpanded && (
                        <>
                          <td>{partner.completedBookings}</td>
                          <td className="font-bold">{formatCurrency(partner.revenue)}</td>
                        </>
                      )}
                      <td>
                        <button className="btn btn-outline text-xs px-2 py-1 mr-2">Edit</button>
                        <button className="btn btn-outline text-xs px-2 py-1">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Outsourced Bookings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Outsourced Bookings</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Partner</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outsourcedBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="font-medium">{booking.customer}</td>
                      <td>{booking.partner}</td>
                      <td>{booking.date}</td>
                      <td className="font-bold">{formatCurrency(booking.amount)}</td>
                      <td>
                        <span className={`badge ${
                          booking.status === 'completed' ? 'badge-green' :
                          booking.status === 'in-progress' ? 'badge-blue' :
                          'badge-yellow'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Export Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report) => (
                <div key={report.id} className="border rounded-lg p-6 hover:border-purple-300 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-lg ${report.color.replace('text-', 'bg-').replace('-600', '-100')} flex items-center justify-center mr-4`}>
                      <report.icon className={`w-6 h-6 ${report.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                      <p className="text-sm text-slate-600">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleExportReport(report.id, 'csv')}
                      className="btn btn-outline flex-1"
                    >
                      CSV
                    </button>
                    <button 
                      onClick={() => handleExportReport(report.id, 'pdf')}
                      className="btn btn-outline flex-1"
                    >
                      PDF
                    </button>
                    <button 
                      onClick={() => handleExportReport(report.id, 'excel')}
                      className="btn btn-outline flex-1"
                    >
                      Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isOpen={showReportModal}
          onClose={closeReportModal}
          data={{
            monthlyStats,
            invoiceStats,
            customers,
            drivers,
            vehicles: fleet,
            bookings: filteredBookings
          }}
        />
      )}

      {/* Add export UI improvements */}
      {showReportModal && (
        <div className="fixed bottom-8 right-8 z-50 flex items-end justify-end">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition"
              onClick={closeReportModal}
            >
              <CloseIcon className="w-5 h-5 drop-shadow-sm hover:drop-shadow-lg" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
              <DownloadIcon className="w-5 h-5 drop-shadow-sm hover:drop-shadow-lg" /> Export Report
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  className="btn btn-outline"
                  disabled={isExporting}
                  onClick={() => handleExportReport(selectedReport.id, 'csv')}
                >
                  Export CSV
                </button>
                <button
                  className="btn btn-outline"
                  disabled={isExporting}
                  onClick={() => handleExportReport(selectedReport.id, 'pdf')}
                >
                  Export PDF
                </button>
              </div>
              {isExporting && (
                <div className="mt-2 text-sm text-blue-600">Exporting... Please wait.</div>
              )}
              {exportSuccess && (
                <div className="mt-2 text-sm text-green-600">Export successful!</div>
              )}
              {exportError && (
                <div className="mt-2 text-sm text-red-600">Export failed. Please try again.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}