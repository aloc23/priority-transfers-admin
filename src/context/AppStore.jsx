// src/context/AppStore.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";
import { isDemoModeEnabled } from "../utils/demoMode";
import { withTimeout, isNetworkError } from "../utils/timeout";

const AppStoreContext = createContext();

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within an AppStoreProvider");
  return ctx;
}

export function AppStoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeEnabled());

  // Entities
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [estimations, setEstimations] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);

  // Global calendar and filter state for synchronization between dashboard and schedule
  const [globalCalendarState, setGlobalCalendarState] = useState({
    selectedDate: null,
    selectedStatus: null,
    selectedDriver: '',
    currentView: 'month'
  });

  // Auth error modal
  const [authErrorModal, setAuthErrorModal] = useState({ isOpen: false, error: null });
  
  // General error modal
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', error: null });

  //
  // 🔹 Auth lifecycle
  //
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Always resolve loading state within a reasonable timeout
        const timeoutId = setTimeout(() => {
          console.warn('Initialization timeout - falling back to demo mode');
          setNetworkError(true);
          setIsDemoMode(true);
          setLoading(false);
        }, 10000); // 10 second timeout

        // Force demo mode if explicitly enabled
        if (isDemoModeEnabled()) {
          clearTimeout(timeoutId);
          console.log('Demo mode enabled via environment variable');
          setIsDemoMode(true);
          // Initialize empty data arrays for demo mode
          setBookings([]);
          setCustomers([]);
          setDrivers([]);
          setVehicles([]);
          setInvoices([]);
          setPartners([]);
          setExpenses([]);
          setIncome([]);
          setEstimations([]);
          setActivityHistory([]);
          setLoading(false);
          return;
        }

        // Try to get session with timeout
        const sessionResult = await withTimeout(
          supabase.auth.getSession(), 
          5000, 
          'Supabase session check'
        );
        
        clearTimeout(timeoutId);
        
        if (!mounted) return;
        
        const { data, error } = sessionResult;
        if (error) {
          console.error("Session error:", error);
          if (isNetworkError(error)) {
            setNetworkError(true);
            setIsDemoMode(true);
          }
        }

        setSession(data?.session || null);

        if (data?.session?.user) {
          await setupUserProfile(data.session.user);
          await loadAllData();
        }

        setLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        
        // If it's a network error, enable demo mode
        if (isNetworkError(error)) {
          setNetworkError(true);
          setIsDemoMode(true);
        }
        
        // Always ensure loading is set to false
        setLoading(false);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        setSession(session);

        try {
          if (event === "SIGNED_IN" && session?.user) {
            await setupUserProfile(session.user);
            await loadAllData();
          } else if (event === "SIGNED_OUT") {
            clearAllData();
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          if (isNetworkError(error)) {
            setNetworkError(true);
          }
        }
      }
    );

    init();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password }) => {
    // Demo mode login
    if (isDemoMode || isDemoModeEnabled()) {
      console.log('Demo mode login');
      const demoUser = {
        id: 'demo-user',
        email: email || 'demo@example.com',
        name: 'Demo User',
        role: 'Admin'
      };
      setCurrentUser(demoUser);
      setSession({ user: demoUser });
      return { success: true, user: demoUser };
    }

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        8000,
        'Supabase login'
      );
      
      if (error) {
        if (isNetworkError(error)) {
          setNetworkError(true);
          showErrorModal('Network Error', 'Unable to connect to the server. You can continue in demo mode.');
        } else {
          showAuthErrorModal(error);
        }
        return { success: false, error: error.message };
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      
      if (isNetworkError(error)) {
        setNetworkError(true);
        showErrorModal('Network Error', 'Connection failed. You can continue in demo mode.');
      } else {
        showAuthErrorModal({ message: 'Login failed. Please try again.' });
      }
      
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    if (isDemoMode || isDemoModeEnabled()) {
      console.log('Demo mode logout');
      setCurrentUser(null);
      setSession(null);
      return;
    }

    try {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        5000,
        'Supabase logout'
      );
      if (error) {
        console.error('Logout error:', error);
        if (isNetworkError(error)) {
          setNetworkError(true);
        }
      }
    } catch (error) {
      console.error('Logout timeout/error:', error);
    }
  };

  const setupUserProfile = async (user) => {
    // Skip profile setup in demo mode
    if (isDemoMode || isDemoModeEnabled()) {
      setCurrentUser({
        id: user.id || 'demo-user',
        email: user.email || 'demo@example.com',
        name: 'Demo User',
        role: 'Admin'
      });
      return;
    }

    try {
      const { data: profile, error } = await withTimeout(
        supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single(),
        5000,
        'Profile fetch'
      );

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
        if (isNetworkError(error)) {
          setNetworkError(true);
        }
      }

      let role = "Admin";
      let name = user.email;

      if (profile) {
        role = profile.role || "Admin";
        name = profile.full_name || user.email;
      } else {
        // Try to create profile, but don't fail if it doesn't work
        // Let database default to 'admin' role as defined in migration.sql
        try {
          await supabase.from("profiles").insert([
            { id: user.id, full_name: user.email }
          ]);
          // Use default admin role since database defaults to 'admin'
          role = "Admin";
        } catch (insertErr) {
          console.error("Profile insert error (non-fatal):", insertErr);
          // If profile creation fails, still give admin access by default
          role = "Admin";
        }
      }

      setCurrentUser({ id: user.id, email: user.email, name, role });
    } catch (error) {
      console.error("Setup user profile error:", error);
      // Set a basic user profile even if database operations fail
      setCurrentUser({ 
        id: user.id, 
        email: user.email, 
        name: user.email, 
        role: "Admin" 
      });
    }
  };

  //
  // 🔹 Data fetch
  //
  const loadAllData = async () => {
    // Skip data loading in demo mode
    if (isDemoMode || isDemoModeEnabled()) {
      console.log('Skipping data load in demo mode');
      return;
    }

    try {
      // Load data with timeouts and error handling
      const loadPromises = [
        loadBookings(),
        loadCustomers(),
        loadDrivers(),
        loadVehicles(),
        loadInvoices(),
        loadPartners(),
        loadExpenses(),
        loadIncome(),
        loadEstimations(),
      ];

      // Don't fail the entire initialization if some data fails to load
      await Promise.allSettled(loadPromises);
    } catch (error) {
      console.error('Error loading data (non-fatal):', error);
      if (isNetworkError(error)) {
        setNetworkError(true);
      }
    }
  };

  const clearAllData = () => {
    setBookings([]);
    setCustomers([]);
    setDrivers([]);
    setVehicles([]);
    setInvoices([]);
    setPartners([]);
    setExpenses([]);
    setIncome([]);
    setEstimations([]);
    setActivityHistory([]);
  };

  //
  // 🔹 Generic CRUD helpers
  //
  const fetchTable = async (table, setter) => {
    try {
      const { data, error } = await withTimeout(
        supabase.from(table).select("*"),
        5000,
        `Fetch ${table}`
      );
      
      if (error) { 
        console.error(`Fetch ${table} error:`, error); 
        if (isNetworkError(error)) {
          setNetworkError(true);
        }
        return []; 
      }
      
      setter(data || []); 
      return data;
    } catch (error) {
      console.error(`Fetch ${table} timeout/error:`, error);
      if (isNetworkError(error)) {
        setNetworkError(true);
      }
      return [];
    }
  };

  const insertRow = async (table, record, setter) => {
    const { data, error } = await supabase.from(table).insert(record).select().single();
    if (error) return { success: false, error };
    setter((prev) => [...prev, data]);
    return { success: true, data };
  };

  const updateRow = async (table, id, updates, setter) => {
    const { data, error } = await supabase.from(table).update(updates).eq("id", id).select().single();
    if (error) return { success: false, error };
    setter((prev) => prev.map((item) => (item.id === id ? data : item)));
    return { success: true, data };
  };

  const deleteRow = async (table, id, setter) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { success: false, error };
    setter((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  //
  // 🔹 Bookings
  //
  const loadBookings = () => fetchTable("bookings", setBookings);
  const addBooking = (b) => insertRow("bookings", b, setBookings);
  const updateBooking = (id, u) => updateRow("bookings", id, u, setBookings);
  const deleteBooking = (id) => deleteRow("bookings", id, setBookings);

  //
  // 🔹 Customers
  //
  const loadCustomers = () => fetchTable("customers", setCustomers);
  const addCustomer = (c) => insertRow("customers", c, setCustomers);
  const updateCustomer = (id, u) => updateRow("customers", id, u, setCustomers);
  const deleteCustomer = (id) => deleteRow("customers", id, setCustomers);

  //
  // 🔹 Drivers
  //
  const loadDrivers = () => fetchTable("drivers", setDrivers);
  const addDriver = (d) => insertRow("drivers", d, setDrivers);
  const updateDriver = (id, u) => updateRow("drivers", id, u, setDrivers);
  const deleteDriver = (id) => deleteRow("drivers", id, setDrivers);

  //
  // 🔹 Vehicles
  //
  const loadVehicles = () => fetchTable("vehicles", setVehicles);
  const addVehicle = (v) => insertRow("vehicles", v, setVehicles);
  const updateVehicle = (id, u) => updateRow("vehicles", id, u, setVehicles);
  const deleteVehicle = (id) => deleteRow("vehicles", id, setVehicles);

  //
  // 🔹 Invoices
  //
  const loadInvoices = () => fetchTable("invoices", setInvoices);
  const addInvoice = (i) => insertRow("invoices", i, setInvoices);
  const updateInvoice = (id, u) => updateRow("invoices", id, u, setInvoices);
  const deleteInvoice = (id) => deleteRow("invoices", id, setInvoices);

  //
  // 🔹 Partners
  //
  const loadPartners = () => fetchTable("partners", setPartners);
  const addPartner = (p) => insertRow("partners", p, setPartners);
  const updatePartner = (id, u) => updateRow("partners", id, u, setPartners);
  const deletePartner = (id) => deleteRow("partners", id, setPartners);

  //
  // 🔹 Expenses
  //
  const loadExpenses = () => fetchTable("expenses", setExpenses);
  const addExpense = (e) => insertRow("expenses", e, setExpenses);
  const updateExpense = (id, u) => updateRow("expenses", id, u, setExpenses);
  const deleteExpense = (id) => deleteRow("expenses", id, setExpenses);

  //
  // 🔹 Income
  //
  const loadIncome = () => fetchTable("income", setIncome);
  const addIncome = (i) => insertRow("income", i, setIncome);
  const updateIncome = (id, u) => updateRow("income", id, u, setIncome);
  const deleteIncome = (id) => deleteRow("income", id, setIncome);

  //
  // 🔹 Estimations
  //
  const loadEstimations = () => fetchTable("estimations", setEstimations);
  const addEstimation = (e) => insertRow("estimations", e, setEstimations);
  const updateEstimation = (id, u) => updateRow("estimations", id, u, setEstimations);
  const deleteEstimation = (id) => deleteRow("estimations", id, setEstimations);

  //
  // 🔹 Additional functions for Dashboard
  //
  const refreshAllData = async () => {
    if (isDemoMode || isDemoModeEnabled()) {
      console.log('Refreshing demo data - no action needed');
      return;
    }
    // Clear network error when retrying
    setNetworkError(false);
    await loadAllData();
  };

  const generateInvoiceFromBooking = async (bookingId) => {
    // Mock function for demo compatibility
    console.log('Generate invoice from booking:', bookingId);
    return { success: true };
  };

  const markInvoiceAsPaid = async (invoiceId) => {
    // Mock function for demo compatibility  
    console.log('Mark invoice as paid:', invoiceId);
    return { success: true };
  };
  const enableDemoMode = () => {
    setIsDemoMode(true);
    setNetworkError(false);
    const demoUser = {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'Admin'
    };
    setCurrentUser(demoUser);
    setSession({ user: demoUser });
    
    // Initialize with empty arrays to prevent undefined errors
    setBookings([]);
    setCustomers([]);
    setDrivers([]);
    setVehicles([]);
    setInvoices([]);
    setPartners([]);
    setExpenses([]);
    setIncome([]);
    setEstimations([]);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setCurrentUser(null);
    setSession(null);
  };

  // Global calendar state management
  const updateGlobalCalendarState = (updates) => {
    setGlobalCalendarState(prev => ({ ...prev, ...updates }));
  };

  //
  // 🔹 Error modal
  //
  const showAuthErrorModal = (error) => setAuthErrorModal({ isOpen: true, error });
  const hideAuthErrorModal = () => setAuthErrorModal({ isOpen: false, error: null });
  
  const showErrorModal = (title, error) => setErrorModal({ isOpen: true, title, error });
  const hideErrorModal = () => setErrorModal({ isOpen: false, title: '', error: null });
  
  const handleReLogin = () => {
    hideAuthErrorModal();
    // Optionally redirect to login or refresh
  };

  //
  // 🔹 Store value
  //
  const value = {
    currentUser, session, loading, networkError, isDemoMode,
    bookings, customers, drivers, vehicles,
    invoices, partners, expenses, income, estimations, activityHistory,
    globalCalendarState, updateGlobalCalendarState,
    login, logout,
    enableDemoMode, disableDemoMode,
    refreshAllData, generateInvoiceFromBooking, markInvoiceAsPaid,
    addBooking, updateBooking, deleteBooking,
    addCustomer, updateCustomer, deleteCustomer,
    addDriver, updateDriver, deleteDriver,
    addVehicle, updateVehicle, deleteVehicle,
    addInvoice, updateInvoice, deleteInvoice,
    addPartner, updatePartner, deletePartner,
    addExpense, updateExpense, deleteExpense,
    addIncome, updateIncome, deleteIncome,
    addEstimation, updateEstimation, deleteEstimation,
    authErrorModal, showAuthErrorModal, hideAuthErrorModal,
    errorModal, showErrorModal, hideErrorModal, handleReLogin
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}
