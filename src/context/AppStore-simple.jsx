import React, { createContext, useContext, useState, useEffect } from "react";
import { formatCurrency, EURO_PRICE_PER_BOOKING } from "../utils/currency";

const AppStoreContext = createContext();

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppStoreProvider");
  }
  return context;
}

export function AppStoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({ name: "Demo User", role: "Admin" });
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Minimal required functions for the UI to work
  const login = (user) => setCurrentUser(user);
  const logout = () => setCurrentUser(null);
  const addBooking = (booking) => ({ success: true, booking });
  const updateBooking = (id, updates) => ({ success: true });
  const deleteBooking = (id) => ({ success: true });

  const value = {
    currentUser,
    bookings,
    customers, 
    drivers,
    vehicles,
    notifications,
    invoices,
    login,
    logout,
    addBooking,
    updateBooking,
    deleteBooking,
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}