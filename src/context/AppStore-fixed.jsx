import React, { createContext, useContext, useState, useEffect } from "react";
import { formatCurrency, EURO_PRICE_PER_BOOKING } from "../utils/currency";


import { listDrivers, createDriver as apiCreateDriver, updateDriver as apiUpdateDriver, deleteDriver as apiDeleteDriver } from "../api/drivers";
import { listVehicles, createVehicle as apiCreateVehicle, updateVehicle as apiUpdateVehicle, deleteVehicle as apiDeleteVehicle } from "../api/vehicles";
import { listCustomers, createCustomer as apiCreateCustomer, updateCustomer as apiUpdateCustomer, deleteCustomer as apiDeleteCustomer } from "../api/customers";
import { listBookings, createBooking as apiCreateBooking, updateBooking as apiUpdateBooking, deleteBooking as apiDeleteBooking, subscribeBookings } from "../api/bookings";
import { listInvoices, createInvoice as apiCreateInvoice, updateInvoice as apiUpdateInvoice, deleteInvoice as apiDeleteInvoice } from "../api/invoices";
import { listExpenses, createExpense as apiCreateExpense, updateExpense as apiUpdateExpense, deleteExpense as apiDeleteExpense } from "../api/expenses";
import { listIncome, createIncome as apiCreateIncome, updateIncome as apiUpdateIncome, deleteIncome as apiDeleteIncome } from "../api/income";
import { listEstimations, createEstimation as apiCreateEstimation, updateEstimation as apiUpdateEstimation, deleteEstimation as apiDeleteEstimation } from "../api/estimations";
import { listPartners, createPartner as apiCreatePartner, updatePartner as apiUpdatePartner, deletePartner as apiDeletePartner } from "../api/partners";

const AppStoreContext = createContext();

// Import currency utility constant

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

  // Safe localStorage utility functions
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage access failed, using sessionStorage fallback:', error);
        try {
          return sessionStorage.getItem(key);
        } catch (sessionError) {
          console.warn('sessionStorage access also failed:', sessionError);
          return null;
        }
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('localStorage write failed, using sessionStorage fallback:', error);
        try {
          sessionStorage.setItem(key, value);
        } catch (sessionError) {
          console.warn('sessionStorage write also failed:', sessionError);
        }
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage remove failed, using sessionStorage fallback:', error);
        try {
          sessionStorage.removeItem(key);
        } catch (sessionError) {
          console.warn('sessionStorage remove also failed:', sessionError);
        }
      }
    }
  };

  // Load data from localStorage on mount
  
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const [bks, custs, drs, vhs, invs, exps, incs, ests, prts] = await Promise.all([
          listBookings(),
          listCustomers(),
          listDrivers(),
          listVehicles(),
          listInvoices(),
          listExpenses(),
          listIncome(),
          listEstimations(),
          listPartners()
        ]);
        setBookings(bks || []);
        setCustomers(custs || []);
        setDrivers(drs || []);
        setVehicles(vhs || []);
        setInvoices(invs || []);
        setExpenses(exps || []);
        setIncome(incs || []);
        setEstimations(ests || []);
        setPartners(prts || []);
        unsub = subscribeBookings(setBookings);
      } catch (e) {
        console.error("Failed loading initial data from Supabase", e);
      }
    })();
    return () => unsub();
  }, []);
, []);

  const initializeBookings = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeek.getDate() + 3);
    
    const sampleBookings = [
      {
        id: 1,
        customer: "John Doe",
        pickup: "123 Main St",
        destination: "456 Oak Ave",
        date: tomorrow.toISOString().split('T')[0],
        time: "09:00",
        status: "confirmed",
        driver: "Mike Johnson",
        vehicle: "Toyota Camry",
        type: "single",
        source: "internal",
        price: 45,
        pickupCompleted: false,
        returnCompleted: false
      },
      {
        id: 2,
        customer: "Jane Smith",
        pickup: "789 Pine St",
        destination: "321 Elm St",
        date: tomorrow.toISOString().split('T')[0],
        time: "14:30",
        status: "pending",
        driver: "Sarah Wilson",
        vehicle: "Honda Accord",
        type: "single",
        source: "outsourced",
        partner: "City Cab Co.",
        price: 45,
        pickupCompleted: false,
        returnCompleted: false
      },
      {
        id: 3,
        customer: "Business Corp",
        pickup: "Airport Terminal 1",
        destination: "Hotel District",
        tourStartDate: nextWeek.toISOString().split('T')[0],
        tourEndDate: nextWeekEnd.toISOString().split('T')[0],
        tourPickupTime: "08:00",
        tourReturnPickupTime: "18:00",
        status: "confirmed",
        driver: "Tom Brown",
        vehicle: "BMW 7 Series - BMW-001",
        type: "tour",
        source: "internal",
        price: 320,
        pickupCompleted: false,
        returnCompleted: false
      }
    ];
    setBookings(sampleBookings);
    safeLocalStorage.setItem("bookings", JSON.stringify(sampleBookings));
  };

  const initializeCustomers = () => {
    const sampleCustomers = [
      { id: 1, name: "John Doe", email: "john@example.com", phone: "555-0101", totalBookings: 15 },
      { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "555-0102", totalBookings: 8 },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "555-0103", totalBookings: 22 }
    ];
    setCustomers(sampleCustomers);
    safeLocalStorage.setItem("customers", JSON.stringify(sampleCustomers));
  };

  const initializeDrivers = () => {
    const driverColors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e42', // orange
      '#6366f1', // indigo
      '#ef4444', // red
      '#f43f5e', // pink
      '#22d3ee', // cyan
      '#a3e635', // lime
      '#eab308', // yellow
      '#8b5cf6'  // violet
    ];
    const sampleDrivers = [
      { id: 1, name: "Mike Johnson", email: "mike@example.com", license: "D123456", phone: "555-0201", status: "available", rating: 4.8, color: driverColors[0] },
      { id: 2, name: "Sarah Wilson", email: "sarah@example.com", license: "D789012", phone: "555-0202", status: "busy", rating: 4.9, color: driverColors[1] },
      { id: 3, name: "Tom Brown", email: "tom@example.com", license: "D345678", phone: "555-0203", status: "available", rating: 4.7, color: driverColors[2] }
    ];
    setDrivers(sampleDrivers);
    safeLocalStorage.setItem("drivers", JSON.stringify(sampleDrivers));
  };

  // Assign a color to a new driver automatically
  const addDriver = (newDriver) => {
    const created = await apiCreateDriver(driver);
    setDrivers(prev => [...prev, created]);
    return created;
}