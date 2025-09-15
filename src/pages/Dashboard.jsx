import { useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { useFleet } from "../context/FleetContext";
import { useResponsive } from "../hooks/useResponsive";
import { formatCurrency } from "../utils/currency";
import { BookingIcon, CustomerIcon, DriverIcon, VehicleIcon, EstimationIcon, OutsourceIcon, RevenueIcon, EditIcon, TrashIcon, XIcon, UploadIcon } from "../components/Icons";
import StatsCard from "../components/StatsCard";
import DashboardCard from "../components/DashboardCard";
import ActivityList from "../components/ActivityList";
import IncomeModal from "../components/IncomeModal";
import ExpenseModal from "../components/ExpenseModal";
import MobileBookingList from "../components/MobileBookingList";
import PageHeader from "../components/PageHeader";
import UpcomingBookingsWidget from "../components/UpcomingBookingsWidget";
import StatusBlockGrid from "../components/StatusBlockGrid";
import BookingsCalendarWidget from "../components/BookingsCalendarWidget";
import InvoiceStatusBlock from "../components/InvoiceStatusBlock";
import BookingStatusBlock from "../components/BookingStatusBlock";
import BookingInvoiceStatusTabs from "../components/BookingInvoiceStatusTabs";
import CombinedStatusSummary from "../components/CombinedStatusSummary";
import FinancialKPIBlock from "../components/FinancialKPIBlock";
import FleetDriverChecker from "../components/FleetDriverChecker";
import { calculateKPIs } from '../utils/kpi';

export default function Dashboard() {
  const { currentUser, income, expenses, invoices, bookings, customers, drivers, partners, estimations, activityHistory, refreshAllData, addIncome, addExpense, updateIncome, updateExpense, deleteIncome, deleteExpense, updateBooking, generateInvoiceFromBooking, markInvoiceAsPaid } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState('bookings-calendar');
  const [searchParams, setSearchParams] = useSearchParams();
  const [accountingSubTab, setAccountingSubTab] = useState('overview');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const fileInputRef = useRef(null);
  // Invoice Status Block position: 'beside' (beside calendar), 'combined' (replace combined status), 'dropdown' (under booking status)
  const [invoiceStatusPosition, setInvoiceStatusPosition] = useState('combined');

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

  // File upload handler for expenses - Enhanced version
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show loading state
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    loadingToast.textContent = `Processing ${file.name}...`;
    document.body.appendChild(loadingToast);

    try {
      let expensesToAdd = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.csv')) {
        // Enhanced CSV parsing
        const text = await file.text();
        const lines = text.split('\n').slice(1); // Skip header
        expensesToAdd = lines
          .filter(line => line.trim())
          .map(line => {
            const [date, description, amount, category] = line.split(',').map(s => s.trim().replace(/"/g, ''));
            return {
              date: date || new Date().toISOString().split('T')[0],
              description: description || 'Uploaded expense',
              amount: parseFloat(amount) || 0,
              category: category || 'General'
            };
          })
          .filter(expense => expense.amount > 0);
      } else if (fileName.endsWith('.txt')) {
        // Enhanced text parsing - look for patterns like "Date: ... Description: ... Amount: ..."
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const dateMatch = line.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}\.\d{1,2}\.\d{4})/);
          const amountMatch = line.match(/(\d+\.?\d*)/);
          const description = line.replace(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}\.\d{1,2}\.\d{4})/, '').replace(/(\d+\.?\d*)/, '').trim();
          
          if (amountMatch) {
            let parsedDate = new Date().toISOString().split('T')[0];
            if (dateMatch) {
              const dateStr = dateMatch[0];
              if (dateStr.includes('.')) {
                const [day, month, year] = dateStr.split('.');
                parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              } else if (dateStr.includes('/')) {
                const [month, day, year] = dateStr.split('/');
                parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              } else {
                parsedDate = dateStr;
              }
            }
            
            expensesToAdd.push({
              date: parsedDate,
              description: description || 'Uploaded expense',
              amount: parseFloat(amountMatch[0]) || 0
            });
          }
        }
      } else if (fileName.endsWith('.json')) {
        // JSON file support
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          expensesToAdd = data.map(item => ({
            date: item.date || new Date().toISOString().split('T')[0],
            description: item.description || item.memo || item.details || 'Uploaded expense',
            amount: parseFloat(item.amount || item.cost || item.value) || 0
          })).filter(expense => expense.amount > 0);
        }
      } else {
        // For other file types (PDF, Excel), show an enhanced dialog
        const description = prompt('Enter expense description:', `Document: ${file.name}`) || `Document: ${file.name}`;
        const amount = prompt('Enter expense amount (€):');
        if (amount && !isNaN(amount)) {
          expensesToAdd = [{
            date: new Date().toISOString().split('T')[0],
            description: description,
            amount: parseFloat(amount),
            source: 'document'
          }];
        }
      }

      // Add all parsed expenses
      for (const expense of expensesToAdd) {
        addExpense(expense);
      }

      // Remove loading toast
      document.body.removeChild(loadingToast);

      // Show success message
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successToast.textContent = expensesToAdd.length > 0 
        ? `Successfully uploaded ${expensesToAdd.length} expense(s) from ${file.name}` 
        : `No valid expense data found in ${file.name}`;
      document.body.appendChild(successToast);
      setTimeout(() => document.body.removeChild(successToast), 5000);

    } catch (error) {
      console.error('File upload error:', error);
      
      // Remove loading toast if exists
      if (document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }
      
      // Show error message
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorToast.textContent = `Error processing ${file.name}: ${error.message}. Please check the format and try again.`;
      document.body.appendChild(errorToast);
      setTimeout(() => document.body.removeChild(errorToast), 7000);
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const dashboardTabs = [
    { id: 'bookings-calendar', label: 'Bookings & Calendar' },
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

      {/* Bookings & Calendar Tab Content - Calendar as main focus */}
      {activeTab === 'bookings-calendar' && (
        <div className="space-y-6">
          {/* Invoice Status Block Position Switcher */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Invoice Status Display</h3>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Position:</label>
                <select 
                  value={invoiceStatusPosition} 
                  onChange={(e) => setInvoiceStatusPosition(e.target.value)}
                  className="text-xs border rounded px-2 py-1 bg-white border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="beside">Beside Calendar</option>
                  <option value="combined">Replace Combined Status</option>
                  <option value="dropdown">Under Booking Lists</option>
                </select>
              </div>
            </div>
          </div>

          {/* Layout based on Invoice Status Position */}
          {invoiceStatusPosition === 'beside' ? (
            /* Beside Layout - Calendar with Invoice Status Block beside it */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendar Component - 3/4 width */}
              <div className="lg:col-span-3 -mx-6 md:-mx-8 lg:mx-0">
                <BookingsCalendarWidget fullWidth={false} />
              </div>
              
              {/* Invoice Status Block - 1/4 width */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <InvoiceStatusBlock 
                    compact={true}
                    showAddButtons={currentUser?.role === 'Admin'}
                    showInvoiceList={true}
                  />
                </div>
              </div>
            </div>
          ) : invoiceStatusPosition === 'combined' ? (
            /* Replace Combined Status Layout */
            <div className="space-y-6">
              {/* Calendar Component - Full width */}
              <div className="-mx-6 md:-mx-8 lg:-mx-8">
                <BookingsCalendarWidget fullWidth={true} />
              </div>

              {/* Status Summary with Invoice Status replacing Combined Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Status Block instead of Combined Status */}
                <InvoiceStatusBlock 
                  compact={false}
                  showAddButtons={currentUser?.role === 'Admin'}
                  showInvoiceList={true}
                />
                
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 text-lg mb-4">Recent Activity</h3>
                  <ActivityList activities={recentActivity} />
                </div>
              </div>
            </div>
          ) : (
            /* Dropdown Layout - Standard layout with Invoice Status dropdown */
            <div className="space-y-6">
              {/* Calendar Component - Full width */}
              <div className="-mx-6 md:-mx-8 lg:-mx-8">
                <BookingsCalendarWidget fullWidth={true} />
              </div>

              {/* Invoice Status Block as dropdown */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <InvoiceStatusBlock 
                  compact={false}
                  showAddButtons={currentUser?.role === 'Admin'}
                  showInvoiceList={true}
                />
              </div>

              {/* Standard Status Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Combined Status Overview */}
                <CombinedStatusSummary compact={true} />
                
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 text-lg mb-4">Recent Activity</h3>
                  <ActivityList activities={recentActivity} />
                </div>
              </div>
            </div>
          )}
        </div>
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
              {/* Financial KPIs Block at the top of Financial Overview */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <FinancialKPIBlock compact={true} />
              </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 text-lg">All Income</h3>
                  <button className="btn btn-primary" onClick={() => setShowIncomeModal(true)}>Add Income</button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-100 to-green-50 border-b border-green-200">
                        <th className="p-4 text-left font-semibold text-green-800">DATE</th>
                        <th className="p-4 text-left font-semibold text-green-800">DESCRIPTION</th>
                        <th className="p-4 text-left font-semibold text-green-800">AMOUNT (€)</th>
                        <th className="p-4 text-left font-semibold text-green-800">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {income.length > 0 ? income.map((inc, idx) => (
                        <tr key={idx} className="hover:bg-green-50/50 transition-colors">
                          <td className="p-4 text-slate-700">{inc.date}</td>
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{inc.description}</div>
                            {inc.source && <div className="text-xs text-green-600 mt-1">Source: {inc.source}</div>}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                              €{(typeof inc.amount === 'number' ? inc.amount : Number(inc.amount) || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button 
                                className="btn btn-xs btn-outline hover:bg-blue-50" 
                                onClick={() => handleEditIncome(idx)}
                                title="Edit income"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button 
                                className="btn btn-xs btn-danger hover:bg-red-50" 
                                onClick={() => handleDeleteIncome(idx)}
                                title="Delete income"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-slate-500">
                            <RevenueIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No income found</p>
                            <p className="text-sm mt-1">Add income entries to track revenue</p>
                            <button className="btn btn-outline btn-sm mt-4" onClick={refreshAllData}>
                              Refresh Data
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 text-lg">All Expenses</h3>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".csv,.xlsx,.xls,.pdf,.txt,.json"
                      style={{ display: 'none' }}
                      aria-label="Upload expense document"
                    />
                    <button 
                      className="btn btn-outline flex items-center gap-2" 
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload expense documents (CSV, Excel, PDF, TXT, JSON)"
                    >
                      <UploadIcon className="w-4 h-4" />
                      Upload Document
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>Add Expense</button>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-red-100 to-red-50 border-b border-red-200">
                        <th className="p-4 text-left font-semibold text-red-800">DATE</th>
                        <th className="p-4 text-left font-semibold text-red-800">DESCRIPTION</th>
                        <th className="p-4 text-left font-semibold text-red-800">AMOUNT (€)</th>
                        <th className="p-4 text-left font-semibold text-red-800">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.length > 0 ? expenses.map((exp, idx) => (
                        <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                          <td className="p-4 text-slate-700">{exp.date}</td>
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{exp.description}</div>
                            {exp.category && <div className="text-xs text-slate-500 mt-1">{exp.category}</div>}
                            {exp.source && <div className="text-xs text-blue-600 mt-1">Source: {exp.source}</div>}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-red-700 bg-red-50 px-2 py-1 rounded">
                              €{(typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button 
                                className="btn btn-xs btn-outline hover:bg-blue-50" 
                                onClick={() => handleEditExpense(idx)}
                                title="Edit expense"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button 
                                className="btn btn-xs btn-danger hover:bg-red-50" 
                                onClick={() => handleDeleteExpense(idx)}
                                title="Delete expense"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-slate-500">
                            <EstimationIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No expenses found</p>
                            <p className="text-sm mt-1">Upload documents or add expenses manually</p>
                            <div className="flex gap-2 justify-center mt-4">
                              <button 
                                className="btn btn-outline btn-sm" 
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <UploadIcon className="w-4 h-4 mr-1" />
                                Upload Documents
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={refreshAllData}>
                                Refresh Data
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
