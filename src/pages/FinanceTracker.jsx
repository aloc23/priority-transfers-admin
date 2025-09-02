import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { formatCurrency, calculateRevenue, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  FilterIcon, 
  DownloadIcon,
  TrendUpIcon,
  TrendDownIcon,
  RevenueIcon, 
  InvoiceIcon, 
  ViewIcon, 
  SendIcon, 
  XIcon,
  CheckIcon,
  BookingIcon
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
    partners,
    // Billing related
    bookings, 
    invoices, 
    updateInvoice, 
    cancelInvoice, 
    sendInvoice, 
    generateInvoiceFromBooking,
    addInvoice,
    markInvoiceAsPaid,
    // Estimations related
    estimations, 
    addEstimation, 
    updateEstimation, 
    deleteEstimation,
    convertEstimationToBooking,
    customers,
    drivers
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

  // Billing state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [invoiceFormData, setInvoiceFormData] = useState({
    customer: '',
    customerEmail: '',
    amount: EURO_PRICE_PER_BOOKING,
    items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }]
  });

  // Estimations state
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [editingEstimation, setEditingEstimation] = useState(null);
  const [estimationFilters, setEstimationFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    serviceType: 'all'
  });

  const [estimationForm, setEstimationForm] = useState({
    customer: '',
    customerEmail: '',
    fromAddress: '',
    toAddress: '',
    distance: '',
    estimatedDuration: '',
    serviceType: 'priority',
    vehicleType: 'standard',
    basePrice: 45,
    additionalFees: 0,
    totalPrice: 45,
    validUntil: '',
    notes: '',
    status: 'pending'
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

  // Filter billing data
  const completedBookings = bookings.filter(booking => booking.status === "completed");
  const totalRevenue = calculateRevenue(bookings, "completed");
  const pendingPayments = invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);

  const filteredInvoices = invoices.filter(invoice => {
    const statusMatch = filterStatus === 'all' || invoice.status === filterStatus;
    const typeMatch = filterType === 'all' || invoice.type === filterType;
    return statusMatch && typeMatch;
  });

  // Filter estimations data
  const filteredEstimations = estimations.filter(estimation => {
    const estimationDate = new Date(estimation.date);
    const fromDate = estimationFilters.dateFrom ? new Date(estimationFilters.dateFrom) : null;
    const toDate = estimationFilters.dateTo ? new Date(estimationFilters.dateTo) : null;
    
    if (fromDate && estimationDate < fromDate) return false;
    if (toDate && estimationDate > toDate) return false;
    if (estimationFilters.status !== 'all' && estimation.status !== estimationFilters.status) return false;
    if (estimationFilters.serviceType !== 'all' && estimation.serviceType !== estimationFilters.serviceType) return false;
    
    return true;
  });

  // Calculate estimation statistics
  const estimationStats = {
    total: estimations.length,
    pending: estimations.filter(e => e.status === 'pending').length,
    approved: estimations.filter(e => e.status === 'approved').length,
    converted: estimations.filter(e => e.status === 'converted').length,
    totalValue: estimations.reduce((sum, e) => sum + e.totalPrice, 0),
    averageValue: estimations.length > 0 ? estimations.reduce((sum, e) => sum + e.totalPrice, 0) / estimations.length : 0
  };

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
    let data, headers;
    
    switch (type) {
      case 'expenses':
        data = filteredExpenses;
        headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Status'];
        break;
      case 'income':
        data = filteredIncome;
        headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Method', 'Status'];
        break;
      case 'billing':
        data = filteredInvoices;
        headers = ['Invoice #', 'Customer', 'Date', 'Amount', 'Status', 'Type'];
        break;
      case 'estimations':
        data = filteredEstimations;
        headers = ['Customer', 'From', 'To', 'Service Type', 'Total Price', 'Status', 'Date'];
        break;
      default:
        return;
    }
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        switch (type) {
          case 'expenses':
          case 'income':
            return [
              item.date,
              `"${item.description}"`,
              item.category,
              item.type,
              item.amount,
              ...(type === 'income' ? [item.paymentMethod] : []),
              item.status
            ].join(',');
          case 'billing':
            return [
              `INV-${item.id}`,
              `"${item.customer}"`,
              item.date,
              item.amount,
              item.status,
              item.type || 'manual'
            ].join(',');
          case 'estimations':
            return [
              `"${item.customer}"`,
              `"${item.fromAddress}"`,
              `"${item.toAddress}"`,
              item.serviceType,
              item.totalPrice,
              item.status,
              item.date || new Date().toISOString().split('T')[0]
            ].join(',');
          default:
            return '';
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Billing handlers
  const handleInvoiceEdit = (invoice) => {
    setEditingInvoice(invoice);
    setInvoiceFormData({
      customer: invoice.customer,
      customerEmail: invoice.customerEmail,
      amount: invoice.amount,
      items: invoice.items || [{ description: '', quantity: 1, rate: invoice.amount, amount: invoice.amount }]
    });
    setShowInvoiceModal(true);
  };

  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    
    const totalAmount = invoiceFormData.items.reduce((sum, item) => sum + item.amount, 0);
    const invoiceData = {
      ...invoiceFormData,
      amount: totalAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      type: 'manual'
    };
    
    if (editingInvoice) {
      const result = updateInvoice(editingInvoice.id, invoiceData);
      if (result.success) {
        setShowInvoiceModal(false);
        setEditingInvoice(null);
        resetInvoiceForm();
      }
    } else {
      const result = addInvoice(invoiceData);
      if (result.success) {
        setShowInvoiceModal(false);
        resetInvoiceForm();
      }
    }
  };

  const resetInvoiceForm = () => {
    setInvoiceFormData({
      customer: '',
      customerEmail: '',
      amount: EURO_PRICE_PER_BOOKING,
      items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }]
    });
  };

  const handleSendInvoice = (invoice) => {
    if (invoice.customerEmail) {
      sendInvoice(invoice.id, invoice.customerEmail);
    } else {
      alert('Customer email is required to send invoice');
    }
  };

  const handleGenerateInvoice = () => {
    const bookingWithoutInvoice = completedBookings.find(booking => 
      !invoices.some(inv => inv.bookingId === booking.id)
    );
    
    if (bookingWithoutInvoice) {
      generateInvoiceFromBooking(bookingWithoutInvoice);
    } else {
      alert('All completed bookings already have invoices generated');
    }
  };

  const updateItemAmount = (index, field, value) => {
    const newItems = [...invoiceFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setInvoiceFormData({ ...invoiceFormData, items: newItems });
  };

  // Estimation handlers
  const calculateTotalPrice = () => {
    const base = Number(estimationForm.basePrice) || 0;
    const fees = Number(estimationForm.additionalFees) || 0;
    return base + fees;
  };

  const updateTotalPrice = () => {
    const total = calculateTotalPrice();
    setEstimationForm({...estimationForm, totalPrice: total});
  };

  const handleEstimationSubmit = (e) => {
    e.preventDefault();
    
    const formData = {
      ...estimationForm,
      distance: Number(estimationForm.distance),
      estimatedDuration: Number(estimationForm.estimatedDuration),
      basePrice: Number(estimationForm.basePrice),
      additionalFees: Number(estimationForm.additionalFees),
      totalPrice: Number(estimationForm.basePrice) + Number(estimationForm.additionalFees)
    };
    
    if (editingEstimation) {
      const result = updateEstimation(editingEstimation.id, formData);
      if (result.success) {
        setShowEstimationModal(false);
        setEditingEstimation(null);
        resetEstimationForm();
      }
    } else {
      const result = addEstimation(formData);
      if (result.success) {
        setShowEstimationModal(false);
        resetEstimationForm();
      }
    }
  };

  const resetEstimationForm = () => {
    setEstimationForm({
      customer: '',
      customerEmail: '',
      fromAddress: '',
      toAddress: '',
      distance: '',
      estimatedDuration: '',
      serviceType: 'priority',
      vehicleType: 'standard',
      basePrice: 45,
      additionalFees: 0,
      totalPrice: 45,
      validUntil: '',
      notes: '',
      status: 'pending'
    });
  };

  const handleEstimationEdit = (estimation) => {
    setEditingEstimation(estimation);
    setEstimationForm(estimation);
    setShowEstimationModal(true);
  };

  const handleApprove = (id) => {
    updateEstimation(id, { status: 'approved' });
  };

  const handleConvert = (id) => {
    if (confirm("Convert this estimation to a booking?")) {
      const result = convertEstimationToBooking(id);
      if (result.success) {
        alert("Estimation successfully converted to booking!");
      } else {
        alert("Failed to convert estimation: " + result.error);
      }
    }
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
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Billing & Invoices
            </button>
            <button
              onClick={() => setActiveTab('estimations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'estimations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estimates Calculator
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
            Export {
              activeTab === 'expenses' ? 'Expenses' : 
              activeTab === 'income' ? 'Income' :
              activeTab === 'billing' ? 'Invoices' :
              activeTab === 'estimations' ? 'Estimations' : 'Data'
            }
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

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            {/* Billing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="bg-emerald-600 rounded-lg p-3 text-white mr-4">
                    <RevenueIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
                    <p className="text-sm text-slate-600">Total Revenue</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-lg p-3 text-white mr-4">
                    <InvoiceIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
                    <p className="text-sm text-slate-600">Total Invoices</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-yellow-600 rounded-lg p-3 text-white mr-4">
                    <ViewIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(pendingPayments)}</p>
                    <p className="text-sm text-slate-600">Pending Payments</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-green-600 rounded-lg p-3 text-white mr-4">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(paidInvoices)}</p>
                    <p className="text-sm text-slate-600">Paid Invoices</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Controls */}
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Types</option>
                  <option value="auto">Auto Generated</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleGenerateInvoice}
                  className="btn btn-primary"
                >
                  Generate Invoice
                </button>
                <button 
                  onClick={() => setShowInvoiceModal(true)}
                  className="btn btn-outline"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Invoice
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-mono text-sm">INV-{invoice.id}</td>
                      <td className="font-medium">{invoice.customer}</td>
                      <td>{invoice.date}</td>
                      <td className="font-bold">{formatCurrency(invoice.amount)}</td>
                      <td>
                        <span className={`badge ${
                          invoice.status === 'paid' ? 'badge-green' :
                          invoice.status === 'sent' ? 'badge-blue' :
                          invoice.status === 'pending' ? 'badge-yellow' :
                          'badge-red'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleInvoiceEdit(invoice)}
                            className="btn btn-outline px-2 py-1 text-xs"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                          {invoice.status === 'pending' && (
                            <button 
                              onClick={() => handleSendInvoice(invoice)}
                              className="btn btn-primary px-2 py-1 text-xs"
                            >
                              <SendIcon className="w-3 h-3" />
                            </button>
                          )}
                          {invoice.status === 'sent' && (
                            <button 
                              onClick={() => markInvoiceAsPaid(invoice.id)}
                              className="btn btn-outline px-2 py-1 text-xs"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estimations Tab */}
        {activeTab === 'estimations' && (
          <div className="space-y-4">
            {/* Estimation Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{estimationStats.total}</div>
                  <div className="text-xs text-slate-600">Total</div>
                </div>
              </div>
              <div className="card p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{estimationStats.pending}</div>
                  <div className="text-xs text-slate-600">Pending</div>
                </div>
              </div>
              <div className="card p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{estimationStats.approved}</div>
                  <div className="text-xs text-slate-600">Approved</div>
                </div>
              </div>
              <div className="card p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{estimationStats.converted}</div>
                  <div className="text-xs text-slate-600">Converted</div>
                </div>
              </div>
            </div>

            {/* Estimation Calculator */}
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Price Calculator</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
                  <input
                    type="text"
                    value={estimationForm.fromAddress}
                    onChange={(e) => setEstimationForm({...estimationForm, fromAddress: e.target.value})}
                    className="form-input"
                    placeholder="Pickup location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Address</label>
                  <input
                    type="text"
                    value={estimationForm.toAddress}
                    onChange={(e) => setEstimationForm({...estimationForm, toAddress: e.target.value})}
                    className="form-input"
                    placeholder="Destination"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={estimationForm.distance}
                    onChange={(e) => setEstimationForm({...estimationForm, distance: e.target.value})}
                    className="form-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={estimationForm.estimatedDuration}
                    onChange={(e) => setEstimationForm({...estimationForm, estimatedDuration: e.target.value})}
                    className="form-input"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    value={estimationForm.serviceType}
                    onChange={(e) => setEstimationForm({...estimationForm, serviceType: e.target.value})}
                    className="form-select"
                  >
                    <option value="priority">Priority Transfer</option>
                    <option value="standard">Standard Transfer</option>
                    <option value="luxury">Luxury Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (€)</label>
                  <input
                    type="number"
                    value={estimationForm.basePrice}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, basePrice: e.target.value});
                      updateTotalPrice();
                    }}
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Fees (€)</label>
                  <input
                    type="number"
                    value={estimationForm.additionalFees}
                    onChange={(e) => {
                      setEstimationForm({...estimationForm, additionalFees: e.target.value});
                      updateTotalPrice();
                    }}
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <div className="text-lg font-semibold">
                  Total Price: <span className="text-purple-600">{formatCurrency(calculateTotalPrice())}</span>
                </div>
                <button 
                  onClick={() => setShowEstimationModal(true)}
                  className="btn btn-primary"
                >
                  Save Estimation
                </button>
              </div>
            </div>

            {/* Estimations List */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Estimations</h3>
                <div className="flex gap-2">
                  <select
                    value={estimationFilters.status}
                    onChange={(e) => setEstimationFilters({...estimationFilters, status: e.target.value})}
                    className="form-select text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="converted">Converted</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Route</th>
                      <th>Service</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEstimations.map((estimation) => (
                      <tr key={estimation.id}>
                        <td className="font-medium">{estimation.customer}</td>
                        <td className="text-sm">{estimation.fromAddress} → {estimation.toAddress}</td>
                        <td>
                          <span className="badge badge-blue">
                            {estimation.serviceType}
                          </span>
                        </td>
                        <td className="font-bold">{formatCurrency(estimation.totalPrice)}</td>
                        <td>
                          <span className={`badge ${
                            estimation.status === 'approved' ? 'badge-green' :
                            estimation.status === 'converted' ? 'badge-purple' :
                            'badge-yellow'
                          }`}>
                            {estimation.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEstimationEdit(estimation)}
                              className="btn btn-outline px-2 py-1 text-xs"
                            >
                              <EditIcon className="w-3 h-3" />
                            </button>
                            {estimation.status === 'pending' && (
                              <button 
                                onClick={() => handleApprove(estimation.id)}
                                className="btn btn-primary px-2 py-1 text-xs"
                              >
                                Approve
                              </button>
                            )}
                            {estimation.status === 'approved' && (
                              <button 
                                onClick={() => handleConvert(estimation.id)}
                                className="btn btn-outline px-2 py-1 text-xs"
                              >
                                <BookingIcon className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-3xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
            </h3>
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer *
                  </label>
                  <input
                    type="text"
                    value={invoiceFormData.customer}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, customer: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={invoiceFormData.customerEmail}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, customerEmail: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Items
                </label>
                {invoiceFormData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItemAmount(index, 'description', e.target.value)}
                      className="form-input"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItemAmount(index, 'quantity', Number(e.target.value))}
                      className="form-input"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateItemAmount(index, 'rate', Number(e.target.value))}
                      className="form-input"
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="text"
                      value={formatCurrency(item.amount)}
                      className="form-input bg-gray-50"
                      readOnly
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingInvoice ? 'Update' : 'Create'} Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setEditingInvoice(null);
                    resetInvoiceForm();
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

      {/* Estimation Modal */}
      {showEstimationModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-3xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingEstimation ? 'Edit Estimation' : 'Save New Estimation'}
            </h3>
            <form onSubmit={handleEstimationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={estimationForm.customer}
                    onChange={(e) => setEstimationForm({...estimationForm, customer: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={estimationForm.customerEmail}
                    onChange={(e) => setEstimationForm({...estimationForm, customerEmail: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={estimationForm.validUntil}
                    onChange={(e) => setEstimationForm({...estimationForm, validUntil: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={estimationForm.vehicleType}
                    onChange={(e) => setEstimationForm({...estimationForm, vehicleType: e.target.value})}
                    className="form-select"
                  >
                    <option value="standard">Standard</option>
                    <option value="luxury">Luxury</option>
                    <option value="van">Van</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={estimationForm.notes}
                  onChange={(e) => setEstimationForm({...estimationForm, notes: e.target.value})}
                  className="form-input"
                  rows="3"
                  placeholder="Additional notes for the estimation..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingEstimation ? 'Update' : 'Save'} Estimation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEstimationModal(false);
                    setEditingEstimation(null);
                    resetEstimationForm();
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