import React, { createContext, useContext, useState, useEffect } from "react";
import { formatCurrency, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { sendDriverConfirmationEmail, generateBookingConfirmationHTML } from "../utils/email";
import { getSupabaseJWT } from "../utils/auth";
import supabase from '../utils/supabaseClient';

// Import API functions
import { fetchBookings, createBooking, updateBooking, deleteBooking } from "../api/bookings";
import { fetchDrivers, createDriver, updateDriver, deleteDriver } from "../api/drivers";
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from "../api/vehicles";
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from "../api/customers";
import { fetchInvoices, createInvoice, updateInvoice, deleteInvoice } from "../api/invoices";
import { fetchPartners, createPartner, updatePartner, deletePartner } from "../api/partners";
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from "../api/expenses";
import { fetchIncome, createIncome, updateIncome, deleteIncome } from "../api/income";
import { fetchEstimations, createEstimation, updateEstimation, deleteEstimation } from "../api/estimations";

const AppStoreContext = createContext();

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppStoreProvider");
  }
  return context;
}

export function AppStoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  
  // New data models for enhanced functionality
  const [partners, setPartners] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [estimations, setEstimations] = useState([]);
  
  // Global calendar and filter state for synchronization between dashboard and schedule
  const [globalCalendarState, setGlobalCalendarState] = useState({
    selectedDate: null,
    selectedStatus: null,
    selectedDriver: '',
    currentView: 'month'
  });

  // Authentication error modal state
  const [authErrorModal, setAuthErrorModal] = useState({
    isOpen: false,
    error: null
  });

  // Loading states for async operations
  const [loading, setLoading] = useState({
    bookings: false,
    customers: false,
    drivers: false,
    vehicles: false,
    invoices: false,
    partners: false,
    expenses: false,
    income: false,
    estimations: false
  });

  // Load data from Supabase on mount and check authentication
  useEffect(() => {
    initializeAuth();
    loadAllData();
  }, []);

const initializeAuth = async () => {
  try {
    // Check if there's an existing session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return;
    }

    if (session?.user) {
      // Fetch user profile from profiles table (match on id, not user_id!)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .eq('id', session.user.id)
        .single();

      let userProfile;
      if (profileError || !profileData) {
        console.warn('No profile found or error fetching profile:', profileError);
        // Fallback: use auth data + metadata
        const userMeta = session.user.user_metadata || {};
        userProfile = {
          id: session.user.id,
          name: userMeta.full_name || session.user.email,
          email: session.user.email,
          role: userMeta.role || "user"
        };
      } else {
        // Merge profile with auth user email
        userProfile = {
          id: profileData.id,
          name: profileData.full_name || session.user.email,
          email: session.user.email,
          phone: profileData.phone,
          role: profileData.role || "user"
        };
      }

      setCurrentUser(userProfile);
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
};

  const loadAllData = async () => {
    try {
      // Load all data in parallel
      await Promise.all([
        loadBookings(),
        loadCustomers(),
        loadDrivers(),
        loadVehicles(),
        loadInvoices(),
        loadPartners(),
        loadExpenses(),
        loadIncome(),
        loadEstimations()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadBookings = async () => {
    setLoading(prev => ({ ...prev, bookings: true }));
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  const loadCustomers = async () => {
    setLoading(prev => ({ ...prev, customers: true }));
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const loadDrivers = async () => {
    setLoading(prev => ({ ...prev, drivers: true }));
    try {
      const data = await fetchDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(prev => ({ ...prev, drivers: false }));
    }
  };

  const loadVehicles = async () => {
    setLoading(prev => ({ ...prev, vehicles: true }));
    try {
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(prev => ({ ...prev, vehicles: false }));
    }
  };

  const loadInvoices = async () => {
    setLoading(prev => ({ ...prev, invoices: true }));
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(prev => ({ ...prev, invoices: false }));
    }
  };

  const loadPartners = async () => {
    setLoading(prev => ({ ...prev, partners: true }));
    try {
      const data = await fetchPartners();
      setPartners(data);
    } catch (error) {
      console.error('Failed to load partners:', error);
    } finally {
      setLoading(prev => ({ ...prev, partners: false }));
    }
  };

  const loadExpenses = async () => {
    setLoading(prev => ({ ...prev, expenses: true }));
    try {
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(prev => ({ ...prev, expenses: false }));
    }
  };

  const loadIncome = async () => {
    setLoading(prev => ({ ...prev, income: true }));
    try {
      const data = await fetchIncome();
      setIncome(data);
    } catch (error) {
      console.error('Failed to load income:', error);
    } finally {
      setLoading(prev => ({ ...prev, income: false }));
    }
  };

  const loadEstimations = async () => {
    setLoading(prev => ({ ...prev, estimations: true }));
    try {
      const data = await fetchEstimations();
      setEstimations(data);
    } catch (error) {
      console.error('Failed to load estimations:', error);
    } finally {
      setLoading(prev => ({ ...prev, estimations: false }));
    }
  };

// Authentication functions
const login = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.warn("Profile fetch failed:", profileError.message);
  }

  const userProfile = {
    id: user.id,
    email: user.email,
    name: profileData?.full_name || user.email,
    phone: profileData?.phone,
    role: profileData?.role || "user"
  };

  setCurrentUser(userProfile);
};

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Clear local state regardless of API result
      setCurrentUser(null);
    }
  };

  // Booking CRUD operations
  const addBooking = async (bookingData) => {
    try {
      const result = await createBooking({
        ...bookingData,
        status: "pending" // Force all new bookings to pending status
      });
      
      if (result.success) {
        await loadBookings(); // Refresh bookings
        addActivityLog({
          type: 'booking_created',
          description: `New booking: ${bookingData.customer}`,
          relatedId: result.booking.id
        });
        return { success: true, booking: result.booking };
      }
      return result;
    } catch (error) {
      console.error('Failed to add booking:', error);
      return { success: false, error: 'Failed to create booking' };
    }
  };

  const updateBookingData = async (id, updates) => {
    try {
      const result = await updateBooking(id, updates);
      
      if (result.success) {
        await loadBookings(); // Refresh bookings
        addActivityLog({
          type: 'booking_updated',
          description: `Booking updated: ${updates.customer || 'customer'}`,
          relatedId: id
        });
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to update booking:', error);
      return { success: false, error: 'Failed to update booking' };
    }
  };

  const deleteBookingData = async (id) => {
    try {
      const booking = bookings.find(b => b.id === id);
      const result = await deleteBooking(id);
      
      if (result.success) {
        await loadBookings(); // Refresh bookings
        addActivityLog({
          type: 'booking_deleted',
          description: `Booking deleted: ${booking?.customer || id}`,
          relatedId: id
        });
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to delete booking:', error);
      return { success: false, error: 'Failed to delete booking' };
    }
  };

  // Customer CRUD operations
  const addCustomer = async (customerData) => {
    try {
      const result = await createCustomer(customerData);
      
      if (result.success) {
        await loadCustomers(); // Refresh customers
        addActivityLog({
          type: 'customer_created',
          description: `New customer: ${customerData.name}`,
          relatedId: result.customer.id
        });
        return { success: true, customer: result.customer };
      }
      return result;
    } catch (error) {
      console.error('Failed to add customer:', error);
      return { success: false, error: 'Failed to create customer' };
    }
  };

  const updateCustomerData = async (id, updates) => {
    try {
      const result = await updateCustomer(id, updates);
      
      if (result.success) {
        await loadCustomers(); // Refresh customers
        addActivityLog({
          type: 'customer_updated',
          description: `Customer updated: ${updates.name || 'customer'}`,
          relatedId: id
        });
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to update customer:', error);
      return { success: false, error: 'Failed to update customer' };
    }
  };

  const deleteCustomerData = async (id) => {
    try {
      const customer = customers.find(c => c.id === id);
      const result = await deleteCustomer(id);
      
      if (result.success) {
        await loadCustomers(); // Refresh customers
        addActivityLog({
          type: 'customer_deleted',
          description: `Customer deleted: ${customer?.name || id}`,
          relatedId: id
        });
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to delete customer:', error);
      return { success: false, error: 'Failed to delete customer' };
    }
  };

  // Driver CRUD operations
  const addDriver = async (driverData) => {
    try {
      const result = await createDriver(driverData);
      
      if (result.success) {
        await loadDrivers(); // Refresh drivers
        addActivityLog({
          type: 'driver_created',
          description: `New driver: ${driverData.name}`,
          relatedId: result.driver.id
        });
        return { success: true, driver: result.driver };
      }
      return result;
    } catch (error) {
      console.error('Failed to add driver:', error);
      return { success: false, error: 'Failed to create driver' };
    }
  };

  const updateDriverData = async (id, updates) => {
    try {
      const result = await updateDriver(id, updates);
      
      if (result.success) {
        await loadDrivers(); // Refresh drivers
        addActivityLog({
          type: 'driver_updated',
          description: `Driver updated: ${updates.name || 'driver'}`,
          relatedId: id
        });
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to update driver:', error);
      return { success: false, error: 'Failed to update driver' };
    }
  };

  const deleteDriverData = async (id) => {
    try {
      const driver = drivers.find(d => d.id === id);
      const result = await deleteDriver(id);
      
      if (result.success) {
        await loadDrivers(); // Refresh drivers
        addActivityLog({
          type: 'driver_deleted',
          description: `Driver deleted: ${driver?.name || id}`,
          relatedId: id
        });
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to delete driver:', error);
      return { success: false, error: 'Failed to delete driver' };
    }
  };

  // Vehicle CRUD operations
  const addVehicle = async (vehicleData) => {
    try {
      const result = await createVehicle(vehicleData);
      
      if (result.success) {
        await loadVehicles(); // Refresh vehicles
        addActivityLog({
          type: 'vehicle_created',
          description: `New vehicle: ${vehicleData.make} ${vehicleData.model}`,
          relatedId: result.vehicle.id
        });
        return { success: true, vehicle: result.vehicle };
      }
      return result;
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      return { success: false, error: 'Failed to create vehicle' };
    }
  };

  const updateVehicleData = async (id, updates) => {
    try {
      const result = await updateVehicle(id, updates);
      
      if (result.success) {
        await loadVehicles(); // Refresh vehicles
        addActivityLog({
          type: 'vehicle_updated',
          description: `Vehicle updated: ${updates.make || ''} ${updates.model || ''}`,
          relatedId: id
        });
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      return { success: false, error: 'Failed to update vehicle' };
    }
  };

  const deleteVehicleData = async (id) => {
    try {
      const vehicle = vehicles.find(v => v.id === id);
      const result = await deleteVehicle(id);
      
      if (result.success) {
        await loadVehicles(); // Refresh vehicles
        addActivityLog({
          type: 'vehicle_deleted',
          description: `Vehicle deleted: ${vehicle?.make || ''} ${vehicle?.model || id}`,
          relatedId: id
        });
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      return { success: false, error: 'Failed to delete vehicle' };
    }
  };

  // Placeholder functions for UI compatibility - these need proper implementation
  const confirmBooking = (id) => {
    return updateBookingData(id, { status: "confirmed" });
  };

  const markBookingCompleted = (id, completionData = {}) => {
    return updateBookingData(id, { 
      status: "completed",
      pickupCompleted: completionData.pickupCompleted ?? true,
      returnCompleted: completionData.returnCompleted ?? true
    });
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    return { success: true, notification: newNotification };
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Activity log function (in-memory for now)
  const addActivityLog = (activity) => {
    const newActivity = {
      ...activity,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'System'
    };
    setActivityHistory(prev => [newActivity, ...prev.slice(0, 99)]); // Keep last 100 entries
  };

  // Placeholder functions that need to be implemented with Supabase
  const generateInvoiceFromBooking = (bookingId) => {
    // TODO: Implement invoice generation
    console.log('generateInvoiceFromBooking not yet implemented for Supabase');
    return { success: false, error: 'Not implemented' };
  };

  // Invoice operations - using the imported API functions  
  const addInvoice = async (invoiceData) => {
    try {
      const result = await createInvoice(invoiceData);
      if (result.success) {
        await loadInvoices();
        addActivityLog({
          type: 'invoice_created',
          description: `New invoice: ${invoiceData.invoiceNumber}`,
          relatedId: result.invoice.id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to add invoice:', error);
      return { success: false, error: 'Failed to create invoice' };
    }
  };

  const updateInvoiceData = async (id, updates) => {
    try {
      const result = await updateInvoice(id, updates);
      if (result.success) {
        await loadInvoices();
        addActivityLog({
          type: 'invoice_updated',
          description: `Invoice updated: ${updates.invoiceNumber || 'invoice'}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to update invoice:', error);
      return { success: false, error: 'Failed to update invoice' };
    }
  };

  const cancelInvoice = (id) => {
    return updateInvoiceData(id, { status: 'cancelled' });
  };

  const sendInvoice = (id) => {
    // TODO: Implement invoice sending
    console.log('sendInvoice not yet implemented for Supabase');
    return { success: false, error: 'Not implemented' };
  };

  const resendInvoice = (id) => {
    return sendInvoice(id);
  };

  const markInvoiceAsPaid = (id) => {
    return updateInvoiceData(id, { status: 'paid', paidDate: new Date().toISOString() });
  };

  // Global calendar state management
  const updateGlobalCalendarState = (updates) => {
    setGlobalCalendarState(prev => ({ ...prev, ...updates }));
  };

  const resetGlobalCalendarFilters = () => {
    setGlobalCalendarState({
      selectedDate: null,
      selectedStatus: null,
      selectedDriver: '',
      currentView: 'month'
    });
  };

  // Authentication modal functions
  const showAuthErrorModal = (error) => {
    setAuthErrorModal({ isOpen: true, error });
  };

  const hideAuthErrorModal = () => {
    setAuthErrorModal({ isOpen: false, error: null });
  };

  const handleReLogin = () => {
    hideAuthErrorModal();
    logout();
  };

  // Placeholder functions for enhanced functionality
  const clearDemoData = () => {
    console.log('clearDemoData - no longer needed with Supabase');
  };

  const loadRealData = () => {
    return loadAllData();
  };

  const resetToDemo = () => {
    console.log('resetToDemo - no longer needed with Supabase');
  };

  const refreshAllData = () => {
    return loadAllData();
  };

  const sendBookingReminder = (id) => {
    // TODO: Implement booking reminder
    console.log('sendBookingReminder not yet implemented');
    return { success: false, error: 'Not implemented' };
  };

  const syncBookingData = () => {
    return loadBookings();
  };

  const syncInvoiceData = () => {
    return loadInvoices();
  };

  // New CRUD operations for enhanced functionality
  const addPartner = async (partnerData) => {
    try {
      const result = await createPartner(partnerData);
      if (result.success) {
        await loadPartners();
        addActivityLog({
          type: 'partner_created',
          description: `New partner: ${partnerData.name}`,
          relatedId: result.partner.id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to add partner:', error);
      return { success: false, error: 'Failed to create partner' };
    }
  };

  const updatePartnerData = async (id, updates) => {
    try {
      const result = await updatePartner(id, updates);
      if (result.success) {
        await loadPartners();
        addActivityLog({
          type: 'partner_updated',
          description: `Partner updated: ${updates.name || 'partner'}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to update partner:', error);
      return { success: false, error: 'Failed to update partner' };
    }
  };

  const deletePartnerData = async (id) => {
    try {
      const partner = partners.find(p => p.id === id);
      const result = await deletePartner(id);
      if (result.success) {
        await loadPartners();
        addActivityLog({
          type: 'partner_deleted',
          description: `Partner deleted: ${partner?.name || id}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to delete partner:', error);
      return { success: false, error: 'Failed to delete partner' };
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const result = await createExpense({
        ...expenseData,
        status: expenseData.status || "pending"
      });
      if (result.success) {
        await loadExpenses();
        addActivityLog({
          type: 'expense_created',
          description: `New expense: ${expenseData.description}`,
          relatedId: result.expense.id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to add expense:', error);
      return { success: false, error: 'Failed to create expense' };
    }
  };

  const updateExpenseData = async (id, updates) => {
    try {
      const result = await updateExpense(id, updates);
      if (result.success) {
        await loadExpenses();
        addActivityLog({
          type: 'expense_updated',
          description: `Expense updated: ${updates.description || 'expense'}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to update expense:', error);
      return { success: false, error: 'Failed to update expense' };
    }
  };

  const deleteExpenseData = async (id) => {
    try {
      const expense = expenses.find(e => e.id === id);
      const result = await deleteExpense(id);
      if (result.success) {
        await loadExpenses();
        addActivityLog({
          type: 'expense_deleted',
          description: `Expense deleted: ${expense?.description || id}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to delete expense:', error);
      return { success: false, error: 'Failed to delete expense' };
    }
  };

  const addIncome = async (incomeData) => {
    try {
      const result = await createIncome({
        ...incomeData,
        status: incomeData.status || "received"
      });
      if (result.success) {
        await loadIncome();
        addActivityLog({
          type: 'income_created',
          description: `New income: ${incomeData.description}`,
          relatedId: result.income.id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to add income:', error);
      return { success: false, error: 'Failed to create income' };
    }
  };

  const updateIncomeData = async (id, updates) => {
    try {
      const result = await updateIncome(id, updates);
      if (result.success) {
        await loadIncome();
        addActivityLog({
          type: 'income_updated',
          description: `Income updated: ${updates.description || 'income'}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to update income:', error);
      return { success: false, error: 'Failed to update income' };
    }
  };

  const deleteIncomeData = async (id) => {
    try {
      const incomeItem = income.find(i => i.id === id);
      const result = await deleteIncome(id);
      if (result.success) {
        await loadIncome();
        addActivityLog({
          type: 'income_deleted',
          description: `Income deleted: ${incomeItem?.description || id}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to delete income:', error);
      return { success: false, error: 'Failed to delete income' };
    }
  };

  const addEstimation = async (estimationData) => {
    try {
      const result = await createEstimation({
        ...estimationData,
        status: estimationData.status || "pending",
        createdBy: currentUser?.name || "System"
      });
      if (result.success) {
        await loadEstimations();
        addActivityLog({
          type: 'estimation_created',
          description: `New estimation for ${estimationData.customerName}`,
          relatedId: result.estimation.id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to add estimation:', error);
      return { success: false, error: 'Failed to create estimation' };
    }
  };

  const updateEstimationData = async (id, updates) => {
    try {
      const result = await updateEstimation(id, updates);
      if (result.success) {
        await loadEstimations();
        addActivityLog({
          type: 'estimation_updated',
          description: `Estimation updated for ${updates.customerName || 'customer'}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to update estimation:', error);
      return { success: false, error: 'Failed to update estimation' };
    }
  };

  const deleteEstimationData = async (id) => {
    try {
      const estimation = estimations.find(e => e.id === id);
      const result = await deleteEstimation(id);
      if (result.success) {
        await loadEstimations();
        addActivityLog({
          type: 'estimation_deleted',
          description: `Estimation deleted for ${estimation?.customerName || id}`,
          relatedId: id
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to delete estimation:', error);
      return { success: false, error: 'Failed to delete estimation' };
    }
  };

  const convertEstimationToBooking = async (estimationId) => {
    try {
      const estimation = estimations.find(e => e.id === estimationId);
      if (!estimation) {
        return { success: false, error: 'Estimation not found' };
      }

      // Create booking from estimation
      const bookingResult = await addBooking({
        customer: estimation.customerName,
        pickup: estimation.pickup,
        destination: estimation.dropoff,
        date: estimation.pickupDate,
        time: estimation.pickupTime,
        price: estimation.estimatedPrice,
        type: estimation.returnDate ? "return" : "single"
      });

      if (bookingResult.success) {
        // Mark estimation as converted
        await updateEstimationData(estimationId, { status: 'converted' });
        return { success: true, booking: bookingResult.booking };
      }

      return bookingResult;
    } catch (error) {
      console.error('Failed to convert estimation:', error);
      return { success: false, error: 'Failed to convert estimation to booking' };
    }
  };

  const value = {
    currentUser,
    bookings,
    customers,
    drivers,
    vehicles,
    notifications,
    invoices,
    activityHistory,
    partners,
    expenses,
    income,
    estimations,
    globalCalendarState,
    authErrorModal,
    loading, // Expose loading states
    login,
    logout,
    addBooking,
    updateBooking: updateBookingData,
    deleteBooking: deleteBookingData,
    confirmBooking,
    markBookingCompleted,
    addCustomer,
    updateCustomer: updateCustomerData,
    deleteCustomer: deleteCustomerData,
    addDriver,
    updateDriver: updateDriverData,
    deleteDriver: deleteDriverData,
    addVehicle,
    updateVehicle: updateVehicleData,
    deleteVehicle: deleteVehicleData,
    addNotification,
    markNotificationRead,
    generateInvoiceFromBooking,
    addInvoice,
    updateInvoice: updateInvoiceData,
    cancelInvoice,
    sendInvoice,
    resendInvoice,
    addActivityLog,
    clearDemoData,
    loadRealData,
    resetToDemo,
    refreshAllData,
    markInvoiceAsPaid,
    sendBookingReminder,
    syncBookingData,
    syncInvoiceData,
    // New CRUD operations
    addPartner,
    updatePartner: updatePartnerData,
    deletePartner: deletePartnerData,
    addExpense,
    updateExpense: updateExpenseData,
    deleteExpense: deleteExpenseData,
    addIncome,
    updateIncome: updateIncomeData,
    deleteIncome: deleteIncomeData,
    addEstimation,
    updateEstimation: updateEstimationData,
    deleteEstimation: deleteEstimationData,
    convertEstimationToBooking,
    updateGlobalCalendarState,
    resetGlobalCalendarFilters,
    // Authentication modal functions
    showAuthErrorModal,
    hideAuthErrorModal,
    handleReLogin
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}
