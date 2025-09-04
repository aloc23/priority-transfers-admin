import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { useFleet } from "../context/FleetContext";
import { formatCurrency } from "../utils/currency";
import { BookingIcon, CustomerIcon, DriverIcon, VehicleIcon, EstimationIcon, OutsourceIcon, RevenueIcon, EditIcon, TrashIcon } from "../components/Icons";
import StatsCard from "../components/StatsCard";
import ActivityList from "../components/ActivityList";
import IncomeModal from "../components/IncomeModal";
import ExpenseModal from "../components/ExpenseModal";
import { calculateKPIs } from '../utils/kpi';

export default function Dashboard() {
  const { income, expenses, invoices, bookings, customers, drivers, partners, estimations, activityHistory, refreshAllData, addIncome, addExpense, updateIncome, updateExpense, deleteIncome, deleteExpense } = useAppStore();
  const { fleet } = useFleet();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchParams, setSearchParams] = useSearchParams();
  const [accountingSubTab, setAccountingSubTab] = useState('overview');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const kpis = calculateKPIs({ income, invoices, expenses });

  // Defensive fallback for blank/undefined KPIs
  const totalIncomeNum = typeof kpis.totalIncome === 'number' ? kpis.totalIncome : 0;
  const paidInvoicesNum = typeof kpis.paidInvoices === 'number' ? kpis.paidInvoices : 0;
  const totalExpensesNum = typeof kpis.totalExpenses === 'number' ? kpis.totalExpenses : 0;
  const netProfitNum = typeof kpis.netProfit === 'number' ? kpis.netProfit : 0;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-2 md:space-x-8 px-2 md:px-0" aria-label="Tabs">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`py-3 px-4 md:py-2 md:px-1 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-all duration-200 min-h-[44px] flex items-center justify-center md:min-h-auto ${
              activeTab === 'overview' 
                ? 'border-purple-500 text-purple-600 bg-purple-50 md:bg-transparent shadow-sm md:shadow-none' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:hover:bg-transparent'
            }`}
            aria-selected={activeTab === 'overview'}
            role="tab"
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('accounting')} 
            className={`py-3 px-4 md:py-2 md:px-1 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-all duration-200 min-h-[44px] flex items-center justify-center md:min-h-auto ${
              activeTab === 'accounting' 
                ? 'border-purple-500 text-purple-600 bg-purple-50 md:bg-transparent shadow-sm md:shadow-none' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:hover:bg-transparent'
            }`}
            aria-selected={activeTab === 'accounting'}
            role="tab"
          >
            Accounting
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <section className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {enhancedStats.map((stat) => (
              <StatsCard key={stat.name} icon={stat.icon} label={stat.name} value={stat.value} className={stat.color} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {operationalStats.map((stat) => (
              <StatsCard key={stat.name} icon={stat.icon} label={stat.name} value={stat.value} className={stat.color} />
            ))}
          </div>
          <ActivityList activities={recentActivity} />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatsCard icon={RevenueIcon} label="Total Income" value={`€${totalIncomeNum.toFixed(2)}`} className="bg-green-100 text-green-700" />
                <StatsCard icon={EstimationIcon} label="Total Expenses" value={`€${totalExpensesNum.toFixed(2)}`} className="bg-red-100 text-red-700" />
                <StatsCard icon={BookingIcon} label="Net Profit" value={`€${netProfitNum.toFixed(2)}`} className="bg-blue-100 text-blue-700" />
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
    </div>
  );
}