// src/context/AppStore.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
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
          new Promise((resolve) => {
            const currentUser = auth.currentUser;
            resolve({ data: { session: currentUser ? { user: currentUser } : null }, error: null });
          }),
          5000,
          'Firebase session check'
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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      setSession(user ? { user } : null);

      try {
        if (user) {
          await setupUserProfile(user);
          await loadAllData();
        } else {
          clearAllData();
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (isNetworkError(error)) {
          setNetworkError(true);
        }
      }
    });

    init();

    return () => {
      mounted = false;
      unsubscribe();
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
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, email, password),
        8000,
        'Firebase login'
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      showAuthErrorModal(error);
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
      await withTimeout(
        signOut(auth),
        5000,
        'Firebase logout'
      );
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
      // Simplified profile setup for Firebase
      const userProfile = {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        role: 'Admin' // Default role for now
      };
      
      setCurrentUser(userProfile);
    } catch (error) {
      console.error("Profile setup error:", error);
      // Fallback profile
      setCurrentUser({
        id: user.uid,
        email: user.email,
        name: user.email?.split('@')[0] || 'User',
        role: 'Admin'
      });
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
      // TODO: Implement Firebase data fetching for table: ${table}
      // For now, return empty array to prevent crashes
      console.log(`Fetching ${table} - using empty data for now`);
      const data = [];
      
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
    try {
      // Add document to Firebase collection
      const docRef = await addDoc(collection(db, table), record);
      const newData = { ...record, id: docRef.id };
      setter((prev) => [...prev, newData]);
      return { success: true, data: newData };
    } catch (error) {
      console.error(`Insert to ${table} failed:`, error);
      return { success: false, error: error.message };
    }
  };

    const updateRow = async (table, id, updatedData, setter) => {
    try {
      // Update document in Firebase collection
      const docRef = doc(db, table, id);
      await updateDoc(docRef, updatedData);
      setter((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item)));
      
      // Special handling for booking confirmation - auto-generate invoice
      if (table === "bookings" && updatedData.status === 'confirmed') {
        const currentBooking = bookings.find(b => b.id === id);
        if (currentBooking && currentBooking.status === 'pending') {
          // Check if invoice doesn't already exist
          const existingInvoice = invoices.find(inv => inv.bookingId === id);
          if (!existingInvoice) {
            // Auto-generate invoice for newly confirmed booking
            const invoice = {
              bookingId: id,
              customer: currentBooking.customer,
              amount: currentBooking.price || 45,
              status: 'pending',
              date: new Date().toISOString().split('T')[0],
              serviceDate: currentBooking.date,
              pickup: currentBooking.pickup,
              destination: currentBooking.destination
            };
            await insertRow("invoices", invoice, setInvoices);
          }
        }
      }
      
      return { success: true, data: updatedData };
    } catch (error) {
      console.error(`Update in ${table} failed:`, error);
      return { success: false, error: error.message };
    }
  };

  const deleteRow = async (table, id, setter) => {
    try {
      // Delete document from Firebase collection
      const docRef = doc(db, table, id);
      await deleteDoc(docRef);
      setter((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (error) {
      console.error(`Delete from ${table} failed:`, error);
      return { success: false, error: error.message };
    }
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
    updateBooking: (id, updates) => updateRow("bookings", id, updates, setBookings),
    deleteBooking: (id) => deleteRow("bookings", id, setBookings),
    addCustomer: (c) => insertRow("customers", c, setCustomers),
    updateCustomer: (id, updates) => updateRow("customers", id, updates, setCustomers),
    deleteCustomer: (id) => deleteRow("customers", id, setCustomers),
    addDriver: (d) => insertRow("drivers", d, setDrivers),
    updateDriver: (id, updates) => updateRow("drivers", id, updates, setDrivers),
    deleteDriver: (id) => deleteRow("drivers", id, setDrivers),
    addVehicle: (v) => insertRow("vehicles", v, setVehicles),
    updateVehicle: (id, updates) => updateRow("vehicles", id, updates, setVehicles),
    deleteVehicle: (id) => deleteRow("vehicles", id, setVehicles),
    addInvoice: (i) => insertRow("invoices", i, setInvoices),
    updateInvoice: (id, updates) => updateRow("invoices", id, updates, setInvoices),
    deleteInvoice: (id) => deleteRow("invoices", id, setInvoices),
    addPartner: (p) => insertRow("partners", p, setPartners),
    updatePartner: (id, updates) => updateRow("partners", id, updates, setPartners),
    deletePartner: (id) => deleteRow("partners", id, setPartners),
    addExpense: (e) => insertRow("expenses", e, setExpenses),
    updateExpense: (id, updates) => updateRow("expenses", id, updates, setExpenses),
    deleteExpense: (id) => deleteRow("expenses", id, setExpenses),
    addIncome: (i) => insertRow("income", i, setIncome),
    updateIncome: (id, updates) => updateRow("income", id, updates, setIncome),
    deleteIncome: (id) => deleteRow("income", id, setIncome),
    addEstimation: (e) => insertRow("estimations", e, setEstimations),
    updateEstimation: (id, updates) => updateRow("estimations", id, updates, setEstimations),
    deleteEstimation: (id) => deleteRow("estimations", id, setEstimations),
    // Invoice generation
    generateInvoiceFromBooking: (booking) => {
      const invoice = {
        bookingId: booking.id,
        customer: booking.customer,
        amount: booking.price || 45,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        serviceDate: booking.date
      };
      return insertRow("invoices", invoice, setInvoices);
    },
    markInvoiceAsPaid: (id) => updateRow("invoices", id, { status: 'paid' }, setInvoices),
    authErrorModal, showAuthErrorModal, hideAuthErrorModal,
    errorModal, showErrorModal, hideErrorModal
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}
