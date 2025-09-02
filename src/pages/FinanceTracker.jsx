import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  FilterIcon, 
  DownloadIcon,
  TrendUpIcon,
  TrendDownIcon
} from "../components/Icons";

export default function FinanceTracker() {
  const { 
    expenses, 
    income, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    partners
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: 'all',
    type: 'all',
    status: 'all'
  });

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'fuel',
    amount: '',
    type: 'internal',
    partner: '',
    vehicle: '',
    driver: '',
    vendor: '',
    receipt: '',
    status: 'pending'
  });

  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'priority_transfer',
    amount: '',
    type: 'internal',
    customer: '',
    partner: '',
    bookingId: '',
    paymentMethod: 'credit_card',
    status: 'received'
  });

  // Filter data based on filters
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    
    if (fromDate && expenseDate < fromDate) return false;
    if (toDate && expenseDate > toDate) return false;
    if (filters.category !== 'all' && expense.category !== filters.category) return false;
    if (filters.type !== 'all' && expense.type !== filters.type) return false;
    if (filters.status !== 'all' && expense.status !== filters.status) return false;
    
    return true;
  });

  const filteredIncome = income.filter(inc => {
    const incomeDate = new Date(inc.date);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    
    if (fromDate && incomeDate < fromDate) return false;
    if (toDate && incomeDate > toDate) return false;
    if (filters.category !== 'all' && inc.category !== filters.category) return false;
    if (filters.type !== 'all' && inc.type !== filters.type) return false;
    if (filters.status !== 'all' && inc.status !== filters.status) return false;
    
    return true;
  });

  // Calculate financial metrics
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = filteredIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;

  const internalExpenses = filteredExpenses.filter(e => e.type === 'internal').reduce((sum, e) => sum + e.amount, 0);
  const outsourcedExpenses = filteredExpenses.filter(e => e.type === 'outsourced').reduce((sum, e) => sum + e.amount, 0);
  const internalIncome = filteredIncome.filter(i => i.type === 'internal').reduce((sum, i) => sum + i.amount, 0);
  const outsourcedIncome = filteredIncome.filter(i => i.type === 'outsourced').reduce((sum, i) => sum + i.amount, 0);

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    
    if (editingExpense) {
      const result = updateExpense(editingExpense.id, {...expenseForm, amount: Number(expenseForm.amount)});
      if (result.success) {
        setShowExpenseModal(false);
        setEditingExpense(null);
        resetExpenseForm();
      }
    } else {
      const result = addExpense({...expenseForm, amount: Number(expenseForm.amount)});
      if (result.success) {
        setShowExpenseModal(false);
        resetExpenseForm();
      }
    }
  };

  const handleIncomeSubmit = (e) => {
    e.preventDefault();
    
    if (editingIncome) {
      const result = updateIncome(editingIncome.id, {...incomeForm, amount: Number(incomeForm.amount)});
      if (result.success) {
        setShowIncomeModal(false);
        setEditingIncome(null);
        resetIncomeForm();
      }
    } else {
      const result = addIncome({...incomeForm, amount: Number(incomeForm.amount)});
      if (result.success) {
        setShowIncomeModal(false);
        resetIncomeForm();
      }
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'fuel',
      amount: '',
      type: 'internal',
      partner: '',
      vehicle: '',
      driver: '',
      vendor: '',
      receipt: '',
      status: 'pending'
    });
  };

  const resetIncomeForm = () => {
    setIncomeForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'priority_transfer',
      amount: '',
      type: 'internal',
      customer: '',
      partner: '',
      bookingId: '',
      paymentMethod: 'credit_card',
      status: 'received'
    });
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({...expense, amount: expense.amount.toString()});
    setShowExpenseModal(true);
  };

  const handleEditIncome = (inc) => {
    setEditingIncome(inc);
    setIncomeForm({...inc, amount: inc.amount.toString()});
    setShowIncomeModal(true);
  };

  const handleDeleteExpense = (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
    }
  };

  const handleDeleteIncome = (id) => {
    if (confirm("Are you sure you want to delete this income entry?")) {
      deleteIncome(id);
    }
  };

  const exportData = (type) => {
    const data = type === 'expenses' ? filteredExpenses : filteredIncome;
    const headers = type === 'expenses' 
      ? ['Date', 'Description', 'Category', 'Type', 'Amount', 'Status']
      : ['Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Method', 'Status'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.date,
        `"${item.description}"`,
        item.category,
        item.type,
        item.amount,
        ...(type === 'income' ? [item.paymentMethod] : []),
        item.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowIncomeModal(true)}
            className="btn btn-outline flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Income
          </button>
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <TrendUpIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{totalIncome.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Income</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
              <TrendDownIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{totalExpenses.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`${netProfit >= 0 ? 'bg-emerald-500' : 'bg-orange-500'} rounded-lg p-3 text-white flex items-center justify-center mr-4`}>
              <span className="text-lg font-bold">€</span>
            </div>
            <div>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{netProfit.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Net Profit</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`${profitMargin >= 0 ? 'bg-blue-500' : 'bg-gray-500'} rounded-lg p-3 text-white flex items-center justify-center mr-4`}>
              <span className="text-lg font-bold">%</span>
            </div>
            <div>
              <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                {profitMargin.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Profit Margin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Internal Revenue</span>
              <span className="font-semibold text-green-600">€{internalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Outsourced Revenue</span>
              <span className="font-semibold text-blue-600">€{outsourcedIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Internal Costs</span>
              <span className="font-semibold text-red-600">€{internalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Outsourced Costs</span>
              <span className="font-semibold text-orange-600">€{outsourcedExpenses.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <FilterIcon className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="form-input text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="form-input text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="form-select text-sm"
            >
              <option value="all">All</option>
              <option value="internal">Internal</option>
              <option value="outsourced">Outsourced</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="form-select text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="received">Received</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expenses ({filteredExpenses.length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'income'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Income ({filteredIncome.length})
            </button>
          </nav>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => exportData(activeTab)}
            className="btn btn-outline flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export {activeTab === 'expenses' ? 'Expenses' : 'Income'}
          </button>
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.date}</td>
                    <td className="font-medium">{expense.description}</td>
                    <td>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {expense.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        expense.type === 'internal' ? 'badge-blue' : 'badge-purple'
                      }`}>
                        {expense.type}
                      </span>
                    </td>
                    <td className="font-bold text-red-600">-€{expense.amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        expense.status === 'approved' ? 'badge-green' :
                        expense.status === 'pending' ? 'badge-yellow' :
                        'badge-red'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditExpense(expense)}
                          className="btn btn-outline px-2 py-1 text-xs"
                        >
                          <EditIcon className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncome.map((inc) => (
                  <tr key={inc.id}>
                    <td>{inc.date}</td>
                    <td className="font-medium">{inc.description}</td>
                    <td>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {inc.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        inc.type === 'internal' ? 'badge-blue' : 'badge-purple'
                      }`}>
                        {inc.type}
                      </span>
                    </td>
                    <td className="font-bold text-green-600">+€{inc.amount.toFixed(2)}</td>
                    <td>{inc.paymentMethod?.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge ${
                        inc.status === 'received' ? 'badge-green' :
                        inc.status === 'pending' ? 'badge-yellow' :
                        'badge-red'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditIncome(inc)}
                          className="btn btn-outline px-2 py-1 text-xs"
                        >
                          <EditIcon className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteIncome(inc.id)}
                          className="btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (€) *
                  </label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="fuel">Fuel</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="outsourced_commission">Outsourced Commission</option>
                    <option value="insurance">Insurance</option>
                    <option value="office">Office</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm({...expenseForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="internal">Internal</option>
                    <option value="outsourced">Outsourced</option>
                  </select>
                </div>
                {expenseForm.type === 'outsourced' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Partner
                    </label>
                    <select
                      value={expenseForm.partner}
                      onChange={(e) => setExpenseForm({...expenseForm, partner: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Select Partner</option>
                      {partners.map(partner => (
                        <option key={partner.id} value={partner.name}>{partner.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={expenseForm.status}
                    onChange={(e) => setExpenseForm({...expenseForm, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                    resetExpenseForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </h3>
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (€) *
                  </label>
                  <input
                    type="number"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={incomeForm.description}
                    onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={incomeForm.category}
                    onChange={(e) => setIncomeForm({...incomeForm, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="priority_transfer">Priority Transfer</option>
                    <option value="outsourced_share">Outsourced Share</option>
                    <option value="subscription">Subscription</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={incomeForm.type}
                    onChange={(e) => setIncomeForm({...incomeForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="internal">Internal</option>
                    <option value="outsourced">Outsourced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <input
                    type="text"
                    value={incomeForm.customer}
                    onChange={(e) => setIncomeForm({...incomeForm, customer: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={incomeForm.paymentMethod}
                    onChange={(e) => setIncomeForm({...incomeForm, paymentMethod: e.target.value})}
                    className="form-select"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={incomeForm.status}
                    onChange={(e) => setIncomeForm({...incomeForm, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="received">Received</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingIncome ? 'Update' : 'Add'} Income
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowIncomeModal(false);
                    setEditingIncome(null);
                    resetIncomeForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}