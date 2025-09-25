// src/context/AppStore.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";
import { isDemoModeEnabled } from "../utils/demoMode";
import { isNetworkError } from "../utils/timeout";
import { performHealthCheck } from "../utils/connectionHealthCheck";

const AppStoreContext = createContext();

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within an AppStoreProvider");
  return ctx;
}

// ✅ Updated timeout wrapper so [] or null don't hang
async function withTimeout(promise, ms, label = "operation") {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export function AppStoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeEnabled());
  const [connectionHealth, setConnectionHealth] = useState(null);

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

  const [globalCalendarState, setGlobalCalendarState] = useState({
    selectedDate: null,
    selectedStatus: null,
    selectedDriver: '',
    currentView: 'month'
  });

  const [authErrorModal, setAuthErrorModal] = useState({ isOpen: false, error: null });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', error: null });

  //
  // 🔹 Auth lifecycle
  //
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const timeoutId = setTimeout(() => {
          console.warn('Initialization timeout - falling back to demo mode');
          setNetworkError(true);
          setIsDemoMode(true);
          setLoading(false);
        }, 15000); // Increased timeout for health check

        if (isDemoModeEnabled()) {
          clearTimeout(timeoutId);
          console.log('Demo mode enabled via env');
          setIsDemoMode(true);
          clearAllData();
          setLoading(false);
          return;
        }

        // Perform comprehensive health check first
        const healthCheck = await performHealthCheck();
        setConnectionHealth(healthCheck);

        if (healthCheck.overall === 'failed') {
          clearTimeout(timeoutId);
          console.error('❌ Health check failed, falling back to demo mode');
          setNetworkError(true);
          setIsDemoMode(true);
          setLoading(false);
          return;
        }

        if (healthCheck.overall === 'warning') {
          console.warn('⚠️ Health check warning:', healthCheck.connection?.warning);
          // Continue with initialization but user will see warnings
        }

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
        if (isNetworkError(error)) {
          setNetworkError(true);
          setIsDemoMode(true);
        }
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

  //
  // 🔹 Auth functions
  //
  const login = async ({ email, password }) => {
    if (isDemoMode || isDemoModeEnabled()) {
      console.log('Demo mode login');
      const demoUser = { id: 'demo-user', email, name: 'Demo User', role: 'Admin' };
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
        showAuthErrorModal(error);
        return { success: false, error: error.message };
      }
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      showAuthErrorModal({ message: 'Login failed' });
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    if (isDemoMode || isDemoModeEnabled()) {
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
      if (error) console.error('Logout error:', error);
    } catch (error) {
      console.error('Logout timeout/error:', error);
    }
  };

  //
  // 🔹 Profile setup (fixed)
  //
  const setupUserProfile = async (user) => {
    if (isDemoMode || isDemoModeEnabled()) {
      setCurrentUser({ id: user.id, email: user.email, name: 'Demo User', role: 'Admin' });
      return;
    }

    try {
      const { data: profile, error } = await withTimeout(
        supabase.from("profiles").select("id, full_name, role").eq("id", user.id).single(),
        5000,
        'Profile fetch'
      );

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
      }

      let finalProfile = profile;

      if (!profile) {
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user.id, full_name: user.email, role: "admin" })
          .select()
          .single();

        if (insertError) {
          console.error("Profile insert failed, falling back:", insertError);
          finalProfile = { id: user.id, full_name: user.email, role: "admin" };
        } else {
          finalProfile = inserted;
        }
      }

      setCurrentUser({
        id: user.id,
        email: user.email,
        name: finalProfile.full_name || user.email,
        role: finalProfile.role || "admin"
      });
    } catch (error) {
      console.error("Setup user profile error:", error);
      setCurrentUser({ id: user.id, email: user.email, name: user.email, role: "admin" });
    }
  };

  //
  // 🔹 Data helpers
  //
  const fetchTable = async (table, setter) => {
    if (isDemoMode || isDemoModeEnabled()) {
      // In demo mode, return empty arrays to prevent errors
      setter([]);
      return [];
    }

    try {
      const { data, error } = await withTimeout(
        supabase.from(table).select("*"),
        8000, // Increased timeout
        `Fetch ${table}`
      );
      
      if (error) {
        console.error(`Fetch ${table} error:`, error);
        
        // Handle specific error types gracefully
        if (error.code === 'PGRST116' || error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn(`Table ${table} does not exist - database schema may need setup`);
          setter([]);
          return [];
        }
        
        // For permission errors, still set empty array to prevent crashes
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          console.warn(`Permission denied for table ${table} - check RLS policies`);
          setter([]);
          return [];
        }
        
        setter([]);
        return [];
      }
      
      // Ensure data is an array to prevent destructuring errors
      const safeData = Array.isArray(data) ? data : [];
      setter(safeData);
      return safeData;
    } catch (error) {
      console.error(`Fetch ${table} timeout/error:`, error);
      // Always set empty array on error to prevent undefined crashes
      setter([]);
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
  // 🔹 Table loaders
  //
  const loadBookings = () => fetchTable("bookings", setBookings);
  const loadCustomers = () => fetchTable("customers", setCustomers);
  const loadDrivers = () => fetchTable("drivers", setDrivers);
  const loadVehicles = () => fetchTable("vehicles", setVehicles);
  const loadInvoices = () => fetchTable("invoices", setInvoices);
  const loadPartners = () => fetchTable("partners", setPartners);
  const loadExpenses = () => fetchTable("expenses", setExpenses);
  const loadIncome = () => fetchTable("income", setIncome);
  const loadEstimations = () => fetchTable("estimations", setEstimations);

  const loadAllData = async () => {
    if (isDemoMode || isDemoModeEnabled()) return;
    await Promise.allSettled([
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
  };

  const clearAllData = () => {
    setBookings([]); setCustomers([]); setDrivers([]); setVehicles([]);
    setInvoices([]); setPartners([]); setExpenses([]); setIncome([]); setEstimations([]);
    setActivityHistory([]);
  };

  //
  // 🔹 Error handling
  //
  const showAuthErrorModal = (error) => setAuthErrorModal({ isOpen: true, error });
  const hideAuthErrorModal = () => setAuthErrorModal({ isOpen: false, error: null });
  const showErrorModal = (title, error) => setErrorModal({ isOpen: true, title, error });
  const hideErrorModal = () => setErrorModal({ isOpen: false, title: '', error: null });

  //
  // 🔹 Store value
  //
  const value = {
    currentUser, session, loading, networkError, isDemoMode, connectionHealth,
    bookings, customers, drivers, vehicles,
    invoices, partners, expenses, income, estimations, activityHistory,
    globalCalendarState, setGlobalCalendarState,
    login, logout, refreshAllData: loadAllData,
    addBooking: (b) => insertRow("bookings", b, setBookings),
    addCustomer: (c) => insertRow("customers", c, setCustomers),
    addDriver: (d) => insertRow("drivers", d, setDrivers),
    addVehicle: (v) => insertRow("vehicles", v, setVehicles),
    addInvoice: (i) => insertRow("invoices", i, setInvoices),
    addPartner: (p) => insertRow("partners", p, setPartners),
    addExpense: (e) => insertRow("expenses", e, setExpenses),
    addIncome: (i) => insertRow("income", i, setIncome),
    addEstimation: (e) => insertRow("estimations", e, setEstimations),
    authErrorModal, showAuthErrorModal, hideAuthErrorModal,
    errorModal, showErrorModal, hideErrorModal
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}