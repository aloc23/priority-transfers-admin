import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { formatCurrency, EURO_PRICE_PER_BOOKING, calculateRevenue } from "../utils/currency";
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
  RevenueIcon,
  InvoiceIcon,
  ReportsIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  StarIcon,
  ViewIcon,
  DownloadIcon,
  SuccessIcon
} from "../components/Icons";
import ReportDetailsModal from "../components/ReportDetailsModal";
import AdvancedFilters from "../components/AdvancedFilters";
import { exportToCSV, exportReportData } from "../utils/export";

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
    estimations,
    // Income functions
    addIncome,
    updateIncome,
    deleteIncome,
    // Expense functions
    addExpense,
    updateExpense,
    deleteExpense,
    // Invoice functions  
    invoices,
    addInvoice,
    updateInvoice,
    // Estimation functions
    addEstimation,
    updateEstimation,
    deleteEstimation
  } = useAppStore();

  // Tab management
  const [activeTab, setActiveTab] = useState('overview');
  const [searchParams, setSearchParams] = useSearchParams();

  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingEstimation, setEditingEstimation] = useState(null);

  // Form states
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

  const [invoiceFormData, setInvoiceFormData] = useState({
    customer: '',
    customerEmail: '',
    amount: EURO_PRICE_PER_BOOKING,
    items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }]
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
  
  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'accounting'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Modal handlers
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

  const handleEstimationSubmit = (e) => {
    e.preventDefault();
    
    const calculateEstimationTotalPrice = () => {
      return Number(estimationForm.basePrice) + Number(estimationForm.additionalFees);
    };

    const formData = {
      ...estimationForm,
      distance: Number(estimationForm.distance),
      estimatedDuration: Number(estimationForm.estimatedDuration),
      basePrice: Number(estimationForm.basePrice),
      additionalFees: Number(estimationForm.additionalFees),
      totalPrice: calculateEstimationTotalPrice()
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

  // Reset form functions
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

  const resetInvoiceForm = () => {
    setInvoiceFormData({
      customer: '',
      customerEmail: '',
      amount: EURO_PRICE_PER_BOOKING,
      items: [{ description: '', quantity: 1, rate: EURO_PRICE_PER_BOOKING, amount: EURO_PRICE_PER_BOOKING }]
    });
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

  // Quick action handlers
  const handleAddIncome = () => {
    setEditingIncome(null);
    resetIncomeForm();
    setShowIncomeModal(true);
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    resetExpenseForm();
    setShowExpenseModal(true);
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    resetInvoiceForm();
    setShowInvoiceModal(true);
  };

  const handleAddEstimation = () => {
    setEditingEstimation(null);
    resetEstimationForm();
    setShowEstimationModal(true);
  };

  // Income handlers
  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setIncomeForm({
      date: income.date,
      description: income.description,
      category: income.category,
      amount: income.amount.toString(),
      type: income.type,
      customer: income.customer || '',
      partner: income.partner || '',
      bookingId: income.bookingId || '',
      paymentMethod: income.paymentMethod,
      status: income.status
    });
    setShowIncomeModal(true);
  };

  const handleDeleteIncome = (incomeId) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      deleteIncome(incomeId);
    }
  };

  // Expense handlers
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      type: expense.type,
      partner: expense.partner || '',
      vehicle: expense.vehicle || '',
      driver: expense.driver || '',
      vendor: expense.vendor || '',
      receipt: expense.receipt || '',
      status: expense.status
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      deleteExpense(expenseId);
    }
  };

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

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabChange('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange('accounting')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'accounting'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Accounting
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          enhancedStats={enhancedStats}
          operationalStats={operationalStats}
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
          profitMargin={profitMargin}
          internalRevenue={internalRevenue}
          outsourcedRevenue={outsourcedRevenue}
          recentBookings={recentBookings}
          recentActivity={recentActivity}
          onAddIncome={handleAddIncome}
          onAddInvoice={handleAddInvoice}
          onAddEstimation={handleAddEstimation}
        />
      )}
      
      {activeTab === 'accounting' && (
        <AccountingTab />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="fuel">Fuel</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="insurance">Insurance</option>
                    <option value="licenses">Licenses</option>
                    <option value="marketing">Marketing</option>
                    <option value="office">Office Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm({...expenseForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="internal">Internal</option>
                    <option value="outsourced">Outsourced</option>
                  </select>
                </div>
              </div>

              {expenseForm.type === 'outsourced' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle (optional)</label>
                  <input
                    type="text"
                    value={expenseForm.vehicle}
                    onChange={(e) => setExpenseForm({...expenseForm, vehicle: e.target.value})}
                    className="form-input"
                    placeholder="Vehicle involved"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm({...expenseForm, vendor: e.target.value})}
                    className="form-input"
                    placeholder="Expense vendor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={expenseForm.status}
                  onChange={(e) => setExpenseForm({...expenseForm, status: e.target.value})}
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
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
                    Customer Name *
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
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    value={invoiceFormData.customerEmail}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, customerEmail: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

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
                      onChange={(e) => {
                        const newItems = [...invoiceFormData.items];
                        newItems[index].description = e.target.value;
                        setInvoiceFormData({...invoiceFormData, items: newItems});
                      }}
                      className="form-input"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...invoiceFormData.items];
                        newItems[index].quantity = Number(e.target.value);
                        newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                        setInvoiceFormData({...invoiceFormData, items: newItems});
                      }}
                      className="form-input"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Rate (€)"
                      value={item.rate}
                      onChange={(e) => {
                        const newItems = [...invoiceFormData.items];
                        newItems[index].rate = Number(e.target.value);
                        newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                        setInvoiceFormData({...invoiceFormData, items: newItems});
                      }}
                      className="form-input"
                      min="0"
                      step="0.01"
                      required
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
              {editingEstimation ? 'Edit Estimation' : 'Create New Estimation'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Address *
                  </label>
                  <input
                    type="text"
                    value={estimationForm.fromAddress}
                    onChange={(e) => setEstimationForm({...estimationForm, fromAddress: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Address *
                  </label>
                  <input
                    type="text"
                    value={estimationForm.toAddress}
                    onChange={(e) => setEstimationForm({...estimationForm, toAddress: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <select
                    value={estimationForm.serviceType}
                    onChange={(e) => setEstimationForm({...estimationForm, serviceType: e.target.value})}
                    className="form-select"
                  >
                    <option value="priority">Priority</option>
                    <option value="outsourced">Outsourced</option>
                  </select>
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
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (€) *
                  </label>
                  <input
                    type="number"
                    value={estimationForm.basePrice}
                    onChange={(e) => setEstimationForm({...estimationForm, basePrice: e.target.value})}
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Fees (€)
                  </label>
                  <input
                    type="number"
                    value={estimationForm.additionalFees}
                    onChange={(e) => setEstimationForm({...estimationForm, additionalFees: e.target.value})}
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
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
                    Total Price (€)
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(Number(estimationForm.basePrice) + Number(estimationForm.additionalFees))}
                    className="form-input bg-gray-50"
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={estimationForm.notes}
                    onChange={(e) => setEstimationForm({...estimationForm, notes: e.target.value})}
                    className="form-input"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingEstimation ? 'Update' : 'Create'} Estimation
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

// OverviewTab Component
function OverviewTab({ 
  enhancedStats, 
  operationalStats, 
  totalRevenue, 
  totalExpenses, 
  netProfit, 
  profitMargin, 
  internalRevenue, 
  outsourcedRevenue, 
  recentBookings, 
  recentActivity,
  onAddIncome,
  onAddInvoice,
  onAddEstimation
}) {
  return (
    <div className="space-y-6">
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
            <button onClick={onAddEstimation} className="block w-full btn btn-primary text-sm">
              <EstimationIcon className="w-4 h-4 mr-2" />
              New Estimation
            </button>
            <Link to="/schedule" className="block w-full btn btn-outline text-sm">
              <BookingIcon className="w-4 h-4 mr-2" />
              New Booking
            </Link>
            <button onClick={onAddInvoice} className="block w-full btn btn-outline text-sm">
              <InvoiceIcon className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
            <button onClick={onAddIncome} className="block w-full btn btn-outline text-sm">
              <RevenueIcon className="w-4 h-4 mr-2" />
              Add Income/Expense
            </button>
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

// AccountingTab Component (combines Finance and Reports)
function AccountingTab() {
  const { 
    bookings, 
    customers, 
    drivers, 
    vehicles, 
    invoices, 
    expenses, 
    income,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense
  } = useAppStore();
  const [searchParams] = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState('finance');

  // Modal states for income and expense management
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form states
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

  // Reports tab specific state
  const [showOutsourced, setShowOutsourced] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportsActiveTab, setReportsActiveTab] = useState("overview");
  const [outsourcingExpanded, setOutsourcingExpanded] = useState(false);
  const [savedViews, setSavedViews] = useState([]);
  const [reportsFilters, setReportsFilters] = useState({
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

  // Handle URL parameters for subtab navigation
  useEffect(() => {
    const subtab = searchParams.get('subtab');
    if (subtab && ['finance', 'income-expenses', 'reports'].includes(subtab)) {
      setActiveSubTab(subtab);
    }
  }, [searchParams]);

  // Form handlers for income
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

  // Quick action handlers
  const handleAddIncome = () => {
    setEditingIncome(null);
    resetIncomeForm();
    setShowIncomeModal(true);
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    resetExpenseForm();
    setShowExpenseModal(true);
  };

  // Reports functionality
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

  // Filter bookings based on advanced filters for reports
  const filteredBookings = bookings.filter(booking => {
    // Basic type filters
    if (!showPriority && booking.type === 'priority') return false;
    if (!showOutsourced && booking.type === 'outsourced') return false;
    
    // Advanced filters
    if (reportsFilters.status !== 'all' && booking.status !== reportsFilters.status) return false;
    if (reportsFilters.type !== 'all' && booking.type !== reportsFilters.type) return false;
    
    // Date range filter
    if (reportsFilters.dateRange?.start && booking.date < reportsFilters.dateRange.start) return false;
    if (reportsFilters.dateRange?.end && booking.date > reportsFilters.dateRange.end) return false;
    
    // Customer filter
    if (reportsFilters.customer && !booking.customer.toLowerCase().includes(reportsFilters.customer.toLowerCase())) return false;
    
    // Driver filter
    if (reportsFilters.driver && !booking.driver.toLowerCase().includes(reportsFilters.driver.toLowerCase())) return false;
    
    // Amount filters
    const amount = booking.amount || EURO_PRICE_PER_BOOKING;
    if (reportsFilters.minAmount && amount < parseFloat(reportsFilters.minAmount)) return false;
    if (reportsFilters.maxAmount && amount > parseFloat(reportsFilters.maxAmount)) return false;
    
    return true;
  }).sort((a, b) => {
    // Apply sorting
    let aVal = a[reportsFilters.sortBy];
    let bVal = b[reportsFilters.sortBy];
    
    if (reportsFilters.sortBy === 'amount') {
      aVal = a.amount || EURO_PRICE_PER_BOOKING;
      bVal = b.amount || EURO_PRICE_PER_BOOKING;
    }
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (reportsFilters.sortOrder === 'asc') {
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
      } else if (format === 'PDF' || format === 'Excel') {
        await exportReportData('booking', exportData);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleSaveView = (view) => {
    const updatedViews = [...savedViews, view];
    setSavedViews(updatedViews);
    localStorage.setItem('reportViews', JSON.stringify(updatedViews));
  };

  const handleLoadView = (view) => {
    setReportsFilters(view.filters);
  };

  // Income handlers
  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setIncomeForm({
      date: income.date,
      description: income.description,
      category: income.category,
      amount: income.amount.toString(),
      type: income.type,
      customer: income.customer || '',
      partner: income.partner || '',
      bookingId: income.bookingId || '',
      paymentMethod: income.paymentMethod,
      status: income.status
    });
    setShowIncomeModal(true);
  };

  const handleDeleteIncome = (incomeId) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      deleteIncome(incomeId);
    }
  };

  // Expense handlers
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      type: expense.type,
      partner: expense.partner || '',
      vehicle: expense.vehicle || '',
      driver: expense.driver || '',
      vendor: expense.vendor || '',
      receipt: expense.receipt || '',
      status: expense.status
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      deleteExpense(expenseId);
    }
  };

  // Financial calculations for Finance sub-tab
  const totalRevenue = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const internalIncome = income.filter(inc => inc.type === 'internal').reduce((sum, inc) => sum + inc.amount, 0);
  const outsourcedIncome = income.filter(inc => inc.type === 'outsourced').reduce((sum, inc) => sum + inc.amount, 0);
  const internalExpenses = expenses.filter(exp => exp.type === 'internal').reduce((sum, exp) => sum + exp.amount, 0);
  const outsourcedExpenses = expenses.filter(exp => exp.type === 'outsourced').reduce((sum, exp) => sum + exp.amount, 0);

  // Filter bookings for Reports sub-tab  
  const accountingBookings = bookings;
  
  // Monthly stats for Reports
  const monthlyStats = {
    totalBookings: accountingBookings.length,
    completedBookings: accountingBookings.filter(b => b.status === "completed").length,
    revenue: totalRevenue,
    averageBookingValue: accountingBookings.length > 0 ? totalRevenue / accountingBookings.length : 0,
    priorityBookings: accountingBookings.filter(b => b.type === "priority").length,
    outsourcedBookings: accountingBookings.filter(b => b.type === "outsourced").length,
    averageRating: 4.7
  };

  const invoiceStats = {
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    pendingInvoices: invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').length,
    totalInvoiceValue: invoices.reduce((sum, inv) => sum + inv.amount, 0)
  };

  // Enhanced KPIs with trend analysis for reports
  const enhancedKPIs = {
    customerRetention: 85.4, // percentage
    averageBookingValue: monthlyStats.revenue / (monthlyStats.totalBookings || 1),
    growthRate: 12.3, // percentage month-over-month
    customerSatisfaction: 4.7,
    operationalEfficiency: 92.1, // percentage
    profitMargin: 23.8, // percentage
    repeatCustomers: customers.filter(c => c.totalBookings > 1).length,
    peakHours: "9:00-11:00 AM, 5:00-7:00 PM"
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
    { id: 3, customer: "Carol White", partner: "Metro Transport", date: "2024-01-22", amount: 55, status: "completed" }
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
      id: 'fleet',
      title: 'Fleet Management',
      description: 'Vehicle utilization and maintenance',
      icon: VehicleIcon,
      color: 'text-purple-600'
    },
    {
      id: 'financial',
      title: 'Financial Summary',
      description: 'Comprehensive financial overview',
      icon: InvoiceIcon,
      color: 'text-emerald-600'
    },
    {
      id: 'growth',
      title: 'Growth Metrics',
      description: 'Business growth and trend analysis',
      icon: TrendUpIcon,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('finance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'finance'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Financial Overview
          </button>
          <button
            onClick={() => setActiveSubTab('income-expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'income-expenses'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Income & Expenses
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'reports'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports & Analytics
          </button>
        </nav>
      </div>

      {/* Finance Sub-tab Content */}
      {activeSubTab === 'finance' && (
        <div className="space-y-6">
          {/* Financial KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
                  <RevenueIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="bg-red-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
                  <span className="text-lg font-bold">€</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                  <p className="text-sm text-slate-600">Total Expenses</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className={`${netProfit >= 0 ? 'bg-emerald-500' : 'bg-orange-500'} rounded-lg p-3 text-white flex items-center justify-center mr-4`}>
                  <span className="text-lg font-bold">€</span>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                  <p className="text-sm text-slate-600">Net Profit</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className={`${profitMargin >= 0 ? 'bg-blue-500' : 'bg-gray-500'} rounded-lg p-3 text-white flex items-center justify-center mr-4`}>
                  <span className="text-lg font-bold">%</span>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-600">Profit Margin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown by Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Internal Revenue</span>
                  <span className="font-semibold text-green-600">{formatCurrency(internalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Outsourced Revenue</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(outsourcedIncome)}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Internal Costs</span>
                  <span className="font-semibold text-red-600">{formatCurrency(internalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Outsourced Costs</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(outsourcedExpenses)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income & Expenses Sub-tab Content */}
      {activeSubTab === 'income-expenses' && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={() => setShowIncomeModal(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Income
            </button>
            <button 
              onClick={() => handleAddExpense()}
              className="btn btn-secondary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Expense
            </button>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
                  <TrendUpIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-gray-600">Total Income</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="bg-red-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
                  <TrendDownIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-3 text-white flex items-center justify-center mr-4">
                  <RevenueIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(netProfit)}</p>
                  <p className="text-sm text-gray-600">Net Profit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Income & Expenses Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Table */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-slate-900">Recent Income</h3>
              </div>
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {income.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              onClick={() => handleEditIncome(item)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteIncome(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-slate-900">Recent Expenses</h3>
              </div>
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              onClick={() => handleEditExpense(item)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Sub-tab Content */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          {/* Reports Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ReportsIcon className="w-7 h-7 text-purple-600" />
              Reports & Analytics Dashboard
            </h2>
            
            {/* Tab Navigation */}
            <div className="flex gap-2">
              <button 
                onClick={() => setReportsActiveTab("overview")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  reportsActiveTab === "overview" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setReportsActiveTab("consolidated")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  reportsActiveTab === "consolidated" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                History & Analytics
              </button>
              <button 
                onClick={() => setReportsActiveTab("export")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  reportsActiveTab === "export" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <DownloadIcon className="w-4 h-4 inline mr-1" />
                Export
              </button>
            </div>
          </div>

          {reportsActiveTab === "overview" && (
            <>
              {/* Enhanced KPI Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{enhancedKPIs.customerRetention}%</div>
                    <div className="text-xs text-slate-600">Customer Retention</div>
                    <div className="flex items-center justify-center mt-1">
                      <TrendUpIcon className="w-3 h-3 text-emerald-500 mr-1" />
                      <span className="text-xs text-emerald-500">+2.3%</span>
                    </div>
                  </div>
                </div>
                
                <div className="card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(enhancedKPIs.averageBookingValue)}</div>
                    <div className="text-xs text-slate-600">Avg Booking Value</div>
                    <div className="flex items-center justify-center mt-1">
                      <TrendUpIcon className="w-3 h-3 text-blue-500 mr-1" />
                      <span className="text-xs text-blue-500">+8.1%</span>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{enhancedKPIs.growthRate}%</div>
                    <div className="text-xs text-slate-600">Growth Rate</div>
                    <div className="flex items-center justify-center mt-1">
                      <TrendUpIcon className="w-3 h-3 text-purple-500 mr-1" />
                      <span className="text-xs text-purple-500">MoM</span>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{enhancedKPIs.customerSatisfaction}</div>
                    <div className="text-xs text-slate-600">Satisfaction</div>
                    <div className="flex items-center justify-center mt-1">
                      <StarIcon className="w-3 h-3 text-orange-500 mr-1" />
                      <span className="text-xs text-orange-500">★★★★★</span>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{enhancedKPIs.operationalEfficiency}%</div>
                    <div className="text-xs text-slate-600">Operational Efficiency</div>
                    <div className="flex items-center justify-center mt-1">
                      <SuccessIcon className="w-3 h-3 text-teal-500 mr-1" />
                      <span className="text-xs text-teal-500">Excellent</span>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{enhancedKPIs.profitMargin}%</div>
                    <div className="text-xs text-slate-600">Profit Margin</div>
                    <div className="flex items-center justify-center mt-1">
                      <TrendUpIcon className="w-3 h-3 text-red-500 mr-1" />
                      <span className="text-xs text-red-500">+1.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Types Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((reportType) => {
                  const IconComponent = reportType.icon;
                  return (
                    <div key={reportType.id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => viewReport(reportType.title)}>
                      <div className="flex items-center p-6">
                        <div className={`rounded-lg p-3 mr-4 ${reportType.color} bg-opacity-10`}>
                          <IconComponent className={`w-8 h-8 ${reportType.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{reportType.title}</h3>
                          <p className="text-sm text-slate-600">{reportType.description}</p>
                          <button className="text-xs text-purple-600 hover:text-purple-800 mt-2 flex items-center">
                            <ViewIcon className="w-3 h-3 mr-1" />
                            View Report
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {reportsActiveTab === "consolidated" && (
            <div className="space-y-6">
              {/* Advanced Filters */}
              <AdvancedFilters
                filters={reportsFilters}
                onFiltersChange={setReportsFilters}
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
                      <p className="text-xs text-green-600">{outsourcingStats.activePartners} active</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg p-3 text-white mr-4">
                      <RevenueIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(outsourcingStats.totalOutsourcedRevenue)}</p>
                      <p className="text-sm text-slate-600">Outsourced Revenue</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-yellow-600 to-orange-500 rounded-lg p-3 text-white mr-4">
                      <StarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{outsourcingStats.averagePartnerRating.toFixed(1)}</p>
                      <p className="text-sm text-slate-600">Avg Partner Rating</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-3 text-white mr-4">
                      <BookingIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{filteredBookings.filter(b => b.type === 'outsourced').length}</p>
                      <p className="text-sm text-slate-600">Outsourced Bookings</p>
                    </div>
                  </div>
                </div>
              </div>

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
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Route</th>
                      <th>Driver</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.slice(0, 10).map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.date}</td>
                        <td className="font-medium">{booking.customer}</td>
                        <td className="text-sm text-slate-600">
                          {booking.pickup} → {booking.destination}
                        </td>
                        <td>{booking.driver}</td>
                        <td>
                          <span className={`badge ${
                            booking.type === 'priority' ? 'badge-purple' : 'badge-blue'
                          }`}>
                            {booking.type}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            booking.status === 'completed' ? 'badge-green' :
                            booking.status === 'in-progress' ? 'badge-yellow' :
                            'badge-gray'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="font-semibold">{formatCurrency(booking.amount || EURO_PRICE_PER_BOOKING)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportsActiveTab === "export" && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <DownloadIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Export Reports</h3>
                <p className="text-slate-600 mb-6">Export your data in various formats</p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => handleExport('CSV')}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('PDF')}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => handleExport('Excel')}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Export Excel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Report Details Modal */}
          {showReportModal && selectedReport && (
            <ReportDetailsModal
              report={selectedReport}
              onClose={closeReportModal}
              data={{
                bookings: filteredBookings,
                customers,
                drivers,
                vehicles,
                invoices,
                enhancedKPIs
              }}
            />
          )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={incomeForm.category}
                    onChange={(e) => setIncomeForm({...incomeForm, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="priority_transfer">Priority Transfer</option>
                    <option value="standard_transfer">Standard Transfer</option>
                    <option value="partner_revenue">Partner Revenue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={incomeForm.type}
                    onChange={(e) => setIncomeForm({...incomeForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="internal">Internal</option>
                    <option value="outsourced">Outsourced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingIncome ? 'Update Income' : 'Add Income'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="fuel">Fuel</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="insurance">Insurance</option>
                    <option value="licenses">Licenses</option>
                    <option value="marketing">Marketing</option>
                    <option value="office">Office Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm({...expenseForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="internal">Internal</option>
                    <option value="outsourced">Outsourced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm({...expenseForm, vendor: e.target.value})}
                  className="form-input"
                  placeholder="Expense vendor"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
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
    </div>
  );
}