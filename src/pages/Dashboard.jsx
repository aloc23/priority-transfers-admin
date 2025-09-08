import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { useFleet } from "../context/FleetContext";
import { useResponsive } from "../hooks/useResponsive";
import { formatCurrency } from "../utils/currency";
import { BookingIcon, CustomerIcon, DriverIcon, VehicleIcon, EstimationIcon, OutsourceIcon, RevenueIcon, EditIcon, TrashIcon, XIcon } from "../components/Icons";
import StatsCard from "../components/StatsCard";
import SmartDashboardWidget from "../components/SmartDashboardWidget";
import DashboardCard from "../components/DashboardCard";
import ActivityList from "../components/ActivityList";
import IncomeModal from "../components/IncomeModal";
import ExpenseModal from "../components/ExpenseModal";
import MobileBookingList from "../components/MobileBookingList";
import PageHeader from "../components/PageHeader";
import UpcomingBookingsWidget from "../components/UpcomingBookingsWidget";
import StatusBlockGrid from "../components/StatusBlockGrid";
import { calculateKPIs } from '../utils/kpi';

export default function Dashboard() {
  const { income, expenses, invoices, bookings, customers, drivers, partners, estimations, activityHistory, refreshAllData, addIncome, addExpense, updateIncome, updateExpense, deleteIncome, deleteExpense, updateBooking, generateInvoiceFromBooking, markInvoiceAsPaid } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchParams, setSearchParams] = useSearchParams();
  const [accountingSubTab, setAccountingSubTab] = useState('overview');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);

  const handleKPIClick = (kpi) => {
    setSelectedKPI(kpi);
    setShowKPIModal(true);
  };

  const kpis = calculateKPIs({ income, invoices, expenses });

  // Defensive fallback for blank/undefined KPIs
  const totalIncomeNum = typeof kpis.totalIncome === 'number' ? kpis.totalIncome : 0;
  const paidInvoicesNum = typeof kpis.paidInvoices === 'number' ? kpis.paidInvoices : 0;
  const totalExpensesNum = typeof kpis.totalExpenses === 'number' ? kpis.totalExpenses : 0;
  const netProfitNum = typeof kpis.netProfit === 'number' ? kpis.netProfit : 0;

  // Calculate Today's Bookings and Confirmed Bookings
  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(booking => booking.date === today);
  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');

  const bookingStats = [
    { name: "Today's Bookings", value: todaysBookings.length, icon: BookingIcon, color: "bg-gradient-to-r from-purple-600 to-purple-500" },
    { name: "Confirmed Bookings", value: confirmedBookings.length, icon: BookingIcon, color: "bg-gradient-to-r from-green-600 to-emerald-500" }
  ];

  // Financial KPIs for Accounting tab only
  const enhancedStats = [
    { name: "Total Income", value: `€${totalIncomeNum.toFixed(2)}`, icon: RevenueIcon, color: "bg-gradient-to-r from-emerald-600 to-green-500" },
    { name: "Paid Invoices", value: `€${paidInvoicesNum.toFixed(2)}`, icon: RevenueIcon, color: "bg-gradient-to-r from-blue-600 to-blue-500" },
    { name: "Total Expenses", value: `€${totalExpensesNum.toFixed(2)}`, icon: EstimationIcon, color: "bg-gradient-to-r from-red-600 to-pink-500" },
    { name: "Net Profit", value: `€${netProfitNum.toFixed(2)}`, icon: BookingIcon, color: "bg-gradient-to-r from-blue-600 to-blue-700" }
  ];
  const operationalStats = [
    { name: "Active Customers", value: customers.length, icon: CustomerIcon, color: "bg-gradient-to-r from-cyan-600 to-blue-500" },
    { name: "Available Drivers", value: drivers.filter(d => d.status === "available").length, icon: DriverIcon, color: "bg-gradient-to-r from-green-600 to-emerald-500" },
    { name: "Active Vehicles", value: fleet?.length || 0, icon: VehicleIcon, color: "bg-gradient-to-r from-slate-600 to-slate-700" }
  ];

  // Combined booking/invoice status logic
  const getCombinedStatus = (booking) => {
    const inv = invoices.find(inv => inv.bookingId === booking.id);
    if (booking.status === 'pending') return 'Pending';
    if (booking.status === 'confirmed') return 'Confirmed';
    if (booking.status === 'completed' && !inv) return 'Completed';
    if (inv && (inv.status === 'pending' || inv.status === 'sent')) return 'Invoiced';
    if (inv && inv.status === 'paid') return 'Paid';
    if (inv && inv.status === 'overdue') return 'Overdue';
    if (booking.status === 'cancelled') return 'Cancelled';
    return 'Other';
  };

  const combinedStatusList = ['Pending', 'Confirmed', 'Completed', 'Invoiced', 'Paid', 'Overdue', 'Cancelled'];
  const combinedStatusColors = {
    Pending: 'bg-gradient-to-r from-amber-600 to-yellow-500',
    Confirmed: 'bg-gradient-to-r from-green-600 to-emerald-500',
    Completed: 'bg-gradient-to-r from-blue-600 to-indigo-500',
    Invoiced: 'bg-gradient-to-r from-orange-500 to-yellow-400',
    Paid: 'bg-gradient-to-r from-blue-700 to-green-500',
    Overdue: 'bg-gradient-to-r from-red-600 to-pink-500',
    Cancelled: 'bg-gradient-to-r from-slate-400 to-slate-600',
    Other: 'bg-gradient-to-r from-slate-300 to-slate-400'
  };
  const bookingsByCombinedStatus = useMemo(() => {
    const map = {};
    combinedStatusList.forEach(status => { map[status] = []; });
    bookings.forEach(b => {
      const status = getCombinedStatus(b);
      if (!map[status]) map[status] = [];
      map[status].push(b);
    });
    return map;
  }, [bookings, invoices]);

  const [selectedCombinedStatus, setSelectedCombinedStatus] = useState(null);
  const recentActivity = activityHistory.slice(0, 5);

  // Helper for recent income/expenses
  const recentIncome = income.slice(-3).reverse();
  const recentExpenses = expenses.slice(-3).reverse();

  function handleSaveIncome(newIncome) {
    if (editingIncome) {
      updateIncome(editingIncome, newIncome);
    } else {
      addIncome(newIncome);
    }
    setShowIncomeModal(false);
    setEditingIncome(null);
  }
  function handleEditIncome(idx) {
    setEditingIncome(income[idx]);
    setShowIncomeModal(true);
  }
  function handleDeleteIncome(idx) {
    const item = income[idx];
    deleteIncome(item.id);
  }
  function handleSaveExpense(newExpense) {
    if (editingExpense) {
      updateExpense(editingExpense, newExpense);
    } else {
      addExpense(newExpense);
    }
    setShowExpenseModal(false);
    setEditingExpense(null);
  }
  function handleEditExpense(idx) {
    setEditingExpense(expenses[idx]);
    setShowExpenseModal(true);
  }
  function handleDeleteExpense(idx) {
    const item = expenses[idx];
    deleteExpense(item.id);
  }

  const dashboardTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'accounting', label: 'Accounting' }
  ];

  // Prepare status data for StatusBlockGrid
  const statusData = combinedStatusList.map(status => ({
    id: status.toLowerCase(),
    label: status,
    count: bookingsByCombinedStatus[status]?.length || 0,
    color: combinedStatusColors[status]
  }));

  return (

    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        plain={true}
      />

      {/* Dashboard Tabs - moved below header, KPI cards removed (now handled by SmartDashboardWidget) */}
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap gap-1 md:gap-0 md:space-x-8 px-2 md:px-0" aria-label="Dashboard Tabs">
          {dashboardTabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`py-3 px-4 md:py-2 md:px-1 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 min-h-[44px] flex items-center justify-center md:min-h-auto flex-1 md:flex-none ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600 bg-blue-50 md:bg-transparent shadow-sm md:shadow-none' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:hover:bg-transparent'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Responsive: Side-by-side on desktop, stacked on mobile */}
      {activeTab === 'overview' && (
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Fleet & Driver Status (SmartDashboardWidget) */}
          <div className="flex-1 min-w-0">
            <SmartDashboardWidget onBookClick={() => setShowIncomeModal(true)} compact />
          </div>
          {/* Booking & Invoice Status + Table */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-0 overflow-hidden flex flex-col gap-0">
              <div className="p-4 pb-2">
                <StatusBlockGrid 
                  title="Booking & Invoice Status"
                  statusData={statusData}
                  selectedStatus={selectedCombinedStatus?.toLowerCase()}
                  onStatusClick={(statusId) => {
                    const status = statusId ? combinedStatusList.find(s => s.toLowerCase() === statusId) : null;
                    setSelectedCombinedStatus(selectedCombinedStatus === status ? null : status);
                  }}
                  className="mb-0"
                />
              </div>
              <div className="border-t border-slate-100 mx-2" />
              <div className="p-4 pt-3">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {selectedCombinedStatus ? `${selectedCombinedStatus} Bookings` : 'Paid Bookings'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="table w-full text-xs">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Driver</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let rows = [];
                        if (selectedCombinedStatus) {
                          if (bookingsByCombinedStatus[selectedCombinedStatus]) {
                            rows = bookingsByCombinedStatus[selectedCombinedStatus].map(booking => {
                              const inv = invoices.find(inv => inv.bookingId === booking.id);
                              // Determine available actions
                              const actions = [];
                              const refresh = () => {
                                if (typeof refreshAllData === 'function') refreshAllData();
                                setTimeout(() => setSelectedCombinedStatus(selectedCombinedStatus), 0);
                              };
                              if (booking.status === 'pending') {
                                actions.push({ label: 'Confirm', onClick: async () => { await updateBooking(booking.id, { ...booking, status: 'confirmed' }); refresh(); } });
                              }
                              if (booking.status === 'confirmed') {
                                actions.push({ label: 'Mark as Complete', onClick: async () => { await updateBooking(booking.id, { ...booking, status: 'completed' }); refresh(); } });
                              }
                              if (booking.status === 'completed' && !inv) {
                                actions.push({ label: 'Generate Invoice', onClick: async () => { await generateInvoiceFromBooking(booking); refresh(); } });
                              }
                              if (inv && (inv.status === 'pending' || inv.status === 'sent')) {
                                actions.push({ label: 'Mark as Paid', onClick: async () => { await markInvoiceAsPaid(inv.id); refresh(); } });
                              }
                              return {
                                customer: booking.customer || booking.customerName || '-',
                                date: booking.date || '-',
                                driver: booking.driver || '-',
                                status: getCombinedStatus(booking),
                                actions
                              };
                            });
                          }
                        } else {
                          // Default: show Paid Bookings (from invoices)
                          rows = invoices.filter(inv => inv.status === 'paid').map(inv => ({
                            customer: inv.customer || '-',
                            date: inv.date || '-',
                            driver: inv.driver || '-',
                            status: inv.status,
                            actions: []
                          }));
                        }
                        return rows.length > 0 ? rows.map((row, i) => (
                          <tr key={i}>
                            <td>{row.customer}</td>
                            <td>{row.date}</td>
                            <td>{row.driver}</td>
                            <td>{row.status}</td>
                            <td>
                              {row.actions && row.actions.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {row.actions.map((action, idx) => (
                                    <button
                                      key={idx}
                                      className="btn btn-xs btn-outline mb-1"
                                      onClick={action.onClick}
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">No actions</span>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="text-center text-slate-400">No records found</td></tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <section className="space-y-6">
          {/* Booking KPIs - Modern Card UI with timeframe dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookingStats.map((stat) => (
              <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col gap-2 hover:shadow-2xl transition-all duration-200 group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-purple-400 to-purple-600 shadow">
                    <stat.icon className="w-7 h-7 text-white" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">{stat.label}</div>
                    <div className="text-2xl font-extrabold text-slate-900 drop-shadow-sm">{stat.value}</div>
                  </div>
                </div>
                {/* Timeframe dropdown (placeholder) */}
                <div className="absolute top-4 right-4">
                  <select className="bg-white/80 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-600 focus:outline-none">
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          {/* Operational Stats - Modern Card UI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {operationalStats.map((stat) => (
              <DashboardCard
                key={stat.name}
                icon={stat.icon}
                name={stat.name}
                value={stat.value}
                dateRange={"Sep 1 - Sep 7, 2025"}
                change={"+0.00% ↑"}
                changeColor="bg-green-100 text-green-700"
                dropdownOptions={["Month", "Quarter", "Year"]}
                moreOptions={true}
                className=""
              />
            ))}
          </div>
          
          {/* Selected Status Bookings Details */}
          {selectedCombinedStatus && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedCombinedStatus} Bookings</h3>
              
              {/* Mobile-friendly card list */}
              {isMobile ? (
                <MobileBookingList 
                  bookings={bookingsByCombinedStatus[selectedCombinedStatus].map(booking => ({
                    ...booking,
                    customer: booking.customer || booking.customerName,
                    status: getCombinedStatus(booking)
                  }))}
                  onActionClick={(booking) => {
                    const inv = invoices.find(inv => inv.bookingId === booking.id);
                    const refresh = () => {
                      if (typeof refreshAllData === 'function') refreshAllData();
                      setTimeout(() => setSelectedCombinedStatus(selectedCombinedStatus), 0);
                    };
                    
                    // Execute primary action based on status
                    if (booking.status === 'pending' || booking.status === 'Pending') {
                      updateBooking(booking.id, { ...booking, status: 'confirmed' });
                      refresh();
                    } else if (booking.status === 'confirmed' || booking.status === 'Confirmed') {
                      updateBooking(booking.id, { ...booking, status: 'completed' });
                      refresh();
                    } else if ((booking.status === 'completed' || booking.status === 'Completed') && !inv) {
                      generateInvoiceFromBooking(booking);
                      refresh();
                    } else if (inv && (inv.status === 'pending' || inv.status === 'sent')) {
                      markInvoiceAsPaid(inv.id);
                      refresh();
                    }
                  }}
                />
              ) : (
                /* Desktop table view */
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Driver</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsByCombinedStatus[selectedCombinedStatus].map(booking => {
                        const inv = invoices.find(inv => inv.bookingId === booking.id);
                        // Determine available actions
                        const actions = [];
                        // Helper to refresh dashboard after action
                        const refresh = () => {
                          if (typeof refreshAllData === 'function') refreshAllData();
                          setTimeout(() => setSelectedCombinedStatus(selectedCombinedStatus), 0);
                        };
                        if (booking.status === 'pending') {
                          actions.push({ label: 'Confirm', onClick: async () => { await updateBooking(booking.id, { ...booking, status: 'confirmed' }); refresh(); } });
                        }
                        if (booking.status === 'confirmed') {
                          actions.push({ label: 'Mark as Complete', onClick: async () => { await updateBooking(booking.id, { ...booking, status: 'completed' }); refresh(); } });
                        }
                        if (booking.status === 'completed' && !inv) {
                          actions.push({ label: 'Generate Invoice', onClick: async () => { await generateInvoiceFromBooking(booking); refresh(); } });
                        }
                        if (inv && (inv.status === 'pending' || inv.status === 'sent')) {
                          actions.push({ label: 'Mark as Paid', onClick: async () => { await markInvoiceAsPaid(inv.id); refresh(); } });
                        }
                        return (
                          <tr key={booking.id}>
                            <td>{booking.customer}</td>
                            <td>{booking.date} {booking.time}</td>
                            <td>{booking.driver}</td>
                            <td>{getCombinedStatus(booking)}</td>
                            <td>
                              <div className="inline-block">
                                {actions.length === 0 && <span className="text-xs text-slate-400">No actions</span>}
                                {actions.length > 0 && (
                                  <div className="flex flex-col gap-1">
                                    {actions.map((action, idx) => (
                                      <button
                                        key={idx}
                                        className="btn btn-xs btn-outline mb-1"
                                        onClick={action.onClick}
                                      >
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Unified Calendar & Bookings Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-6">
            {/* Confirmed Bookings KPI */}
            <div className="flex flex-col items-center bg-green-50 rounded-xl shadow border border-green-100 p-4">
              <span className="text-2xl font-bold text-green-700">{confirmedBookings.length}</span>
              <span className="text-xs text-green-900 tracking-wide mt-1">Confirmed Bookings</span>
            </div>
            {/* Pending Bookings KPI */}
            <div className="flex flex-col items-center bg-yellow-50 rounded-xl shadow border border-yellow-100 p-4">
              <span className="text-2xl font-bold text-yellow-700">{bookings.filter(b => b.status === 'pending').length}</span>
              <span className="text-xs text-yellow-900 tracking-wide mt-1">Pending Bookings</span>
            </div>
            {/* Upcoming Bookings List Block */}
            <div className="col-span-1 md:col-span-1">
              <UpcomingBookingsWidget defaultViewMode="list" showViewModeSelector={true} />
            </div>
          </div>
          
          {/* Activity Section */}
          <div>
            <ActivityList activities={recentActivity} />
          </div>
        </section>
      )}
      {activeTab === 'accounting' && (
        <section className="space-y-8">
          {/* Inner Accounting Tabs */}
          <div className="border-b border-slate-200 mb-4">
            <nav className="flex flex-wrap gap-1 md:gap-0 md:space-x-8 px-2 md:px-0" aria-label="Accounting Subtabs">
              <button 
                onClick={() => setAccountingSubTab('overview')} 
                className={`py-3 px-4 md:py-2 md:px-1 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 min-h-[44px] flex items-center justify-center md:min-h-auto flex-1 md:flex-none ${
                  accountingSubTab === 'overview' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50 md:bg-transparent shadow-sm md:shadow-none' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:hover:bg-transparent'
                }`}
                aria-selected={accountingSubTab === 'overview'}
                role="tab"
              >
                Financial Overview
              </button>
              <button 
                onClick={() => setAccountingSubTab('income-expenses')} 
                className={`py-3 px-4 md:py-2 md:px-1 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 min-h-[44px] flex items-center justify-center md:min-h-auto flex-1 md:flex-none ${
                  accountingSubTab === 'income-expenses' 
                    ? 'border-purple-500 text-purple-600 bg-purple-50 md:bg-transparent shadow-sm md:shadow-none' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:hover:bg-transparent'
                }`}
                aria-selected={accountingSubTab === 'income-expenses'}
                role="tab"
              >
                <span className="hidden sm:inline">Income & Expenses</span>
                <span className="sm:hidden">Income/Expenses</span>
              </button>
              <button 
                onClick={() => setAccountingSubTab('reports')} 
                className={`py-3 px-4 md:py-2 md:px-1 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 min-h-[44px] flex items-center justify-center md:min-h-auto flex-1 md:flex-none ${
                  accountingSubTab === 'reports' 
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50 md:bg-transparent shadow-sm md:shadow-none' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:hover:bg-transparent'
                }`}
                aria-selected={accountingSubTab === 'reports'}
                role="tab"
              >
                <span className="hidden sm:inline">Go to Reports →</span>
                <span className="sm:hidden">Reports</span>
              </button>
            </nav>
          </div>
          {/* Subtab Content */}
          {accountingSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial KPIs replaced by SmartDashboardWidget above */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Recent Income</h3>
                  <table className="w-full text-sm bg-white rounded shadow">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="p-2 text-left">DATE</th>
                        <th className="p-2 text-left">DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIncome.map((inc, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{inc.date}</td>
                          <td className="p-2">{inc.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Recent Expenses</h3>
                  <table className="w-full text-sm bg-white rounded shadow">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="p-2 text-left">DATE</th>
                        <th className="p-2 text-left">DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map((exp, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{exp.date}</td>
                          <td className="p-2">{exp.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {accountingSubTab === 'income-expenses' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">All Income</h3>
                  <button className="btn btn-primary" onClick={() => setShowIncomeModal(true)}>Add Income</button>
                </div>
                <table className="w-full text-sm bg-gradient-to-r from-green-50 to-green-100 rounded shadow">
                  <thead>
                    <tr className="bg-green-200">
                      <th className="p-2 text-left">DATE</th>
                      <th className="p-2 text-left">DESCRIPTION</th>
                      <th className="p-2 text-left">AMOUNT (€)</th>
                      <th className="p-2 text-left">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {income.length > 0 ? income.map((inc, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{inc.date}</td>
                        <td className="p-2">{inc.description}</td>
                        <td className="p-2 text-green-700 font-bold">{(typeof inc.amount === 'number' ? inc.amount : Number(inc.amount) || 0).toFixed(2)}</td>
                        <td className="p-2 flex gap-2">
                          <button className="btn btn-xs btn-outline" onClick={() => handleEditIncome(idx)}><EditIcon className="w-4 h-4" /></button>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDeleteIncome(idx)}><TrashIcon className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-500">
                          <RevenueIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No income found.</p>
                          <button className="btn btn-outline mt-2" onClick={refreshAllData}>Refresh Data</button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Income Modal */}
                {showIncomeModal && (
                  <IncomeModal
                    onSave={handleSaveIncome}
                    onClose={() => setShowIncomeModal(false)}
                    editing={editingIncome}
                  />
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">All Expenses</h3>
                  <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>Add Expense</button>
                </div>
                <table className="w-full text-sm bg-gradient-to-r from-red-50 to-red-100 rounded shadow">
                  <thead>
                    <tr className="bg-red-200">
                      <th className="p-2 text-left">DATE</th>
                      <th className="p-2 text-left">DESCRIPTION</th>
                      <th className="p-2 text-left">AMOUNT (€)</th>
                      <th className="p-2 text-left">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length > 0 ? expenses.map((exp, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{exp.date}</td>
                        <td className="p-2">{exp.description}</td>
                        <td className="p-2 text-red-700 font-bold">{(typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0).toFixed(2)}</td>
                        <td className="p-2 flex gap-2">
                          <button className="btn btn-xs btn-outline" onClick={() => handleEditExpense(idx)}><EditIcon className="w-4 h-4" /></button>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDeleteExpense(idx)}><TrashIcon className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-500">
                          <EstimationIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No expenses found.</p>
                          <button className="btn btn-outline mt-2" onClick={refreshAllData}>Refresh Data</button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Expense Modal */}
                {showExpenseModal && (
                  <ExpenseModal
                    onSave={handleSaveExpense}
                    onClose={() => setShowExpenseModal(false)}
                    editing={editingExpense}
                  />
                )}
              </div>
            </div>
          )}
          {accountingSubTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Reports</h2>
              <button className="btn btn-primary" onClick={() => window.location.href = '#/reports'}>Go to Reports</button>
              {/* Optionally show a summary or preview of recent reports here */}
            </div>
          )}
        </section>
      )}

      {/* KPI Detail Modal */}
      {showKPIModal && selectedKPI && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{selectedKPI.name} Details</h2>
              <button 
                onClick={() => setShowKPIModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
                  <selectedKPI.icon className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedKPI.value}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This metric shows the {selectedKPI.name.toLowerCase()} for your business. 
                {selectedKPI.name.includes('Income') && ' Track your revenue streams and growth.'}
                {selectedKPI.name.includes('Expenses') && ' Monitor your operational costs.'}
                {selectedKPI.name.includes('Customers') && ' See your active customer base.'}
                {selectedKPI.name.includes('Drivers') && ' View available driver capacity.'}
                {selectedKPI.name.includes('Vehicles') && ' Check your fleet status.'}
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button 
                onClick={() => setShowKPIModal(false)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {isMobile ? 'Confirm' : 'View Details'}
              </button>
              <button 
                onClick={() => setShowKPIModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
