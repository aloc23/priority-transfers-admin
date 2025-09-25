// src/context/AppStore.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";

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

  // Auth error modal
  const [authErrorModal, setAuthErrorModal] = useState({ isOpen: false, error: null });

  //
  // 🔹 Auth lifecycle
  //
  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) console.error("Session error:", error);

      setSession(data?.session || null);

      if (data?.session?.user) {
        await setupUserProfile(data.session.user);
        await loadAllData();
      }

      setLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        setSession(session);

        if (event === "SIGNED_IN" && session?.user) {
          await setupUserProfile(session.user);
          await loadAllData();
        } else if (event === "SIGNED_OUT") {
          clearAllData();
          setCurrentUser(null);
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showAuthErrorModal(error);
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) showAuthErrorModal(error);
  };

  const setupUserProfile = async (user) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") console.error("Profile fetch error:", error);

    let role = "User";
    let name = user.email;

    if (profile) {
      role = profile.role || "User";
      name = profile.full_name || user.email;
    } else {
      const { error: insertErr } = await supabase.from("profiles").insert([
        { id: user.id, full_name: user.email, role: "User" }
      ]);
      if (insertErr) console.error("Profile insert error:", insertErr);
    }

    setCurrentUser({ id: user.id, email: user.email, name, role });
  };

  //
  // 🔹 Data fetch
  //
  const loadAllData = async () => {
    await Promise.all([
      loadBookings(),
      loadCustomers(),
      loadDrivers(),
      loadVehicles(),
      loadInvoices(),
      loadPartners(),
      loadExpenses(),
      loadIncome(),
      loadEstimations(),
    ]);
  };

  const clearAllData = () => {
    setBookings([]); setCustomers([]); setDrivers([]); setVehicles([]);
    setInvoices([]); setPartners([]); setExpenses([]); setIncome([]);
    setEstimations([]);
  };

  //
  // 🔹 Generic CRUD helpers
  //
  const fetchTable = async (table, setter) => {
    const { data, error } = await supabase.from(table).select("*");
    if (error) { console.error(`Fetch ${table} error:`, error); return []; }
    setter(data || []); return data;
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
  // 🔹 Error modal
  //
  const showAuthErrorModal = (error) => setAuthErrorModal({ isOpen: true, error });
  const hideAuthErrorModal = () => setAuthErrorModal({ isOpen: false, error: null });

  //
  // 🔹 Store value
  //
  const value = {
    currentUser, session, loading,
    bookings, customers, drivers, vehicles,
    invoices, partners, expenses, income, estimations,
    login, logout,
    addBooking, updateBooking, deleteBooking,
    addCustomer, updateCustomer, deleteCustomer,
    addDriver, updateDriver, deleteDriver,
    addVehicle, updateVehicle, deleteVehicle,
    addInvoice, updateInvoice, deleteInvoice,
    addPartner, updatePartner, deletePartner,
    addExpense, updateExpense, deleteExpense,
    addIncome, updateIncome, deleteIncome,
    addEstimation, updateEstimation, deleteEstimation,
    authErrorModal, showAuthErrorModal, hideAuthErrorModal
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}
