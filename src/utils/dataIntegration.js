/**
 * Data integration helpers for migrating from localStorage to Supabase
 * These functions provide a bridge for components that need to work with both systems
 */

import { isDemoModeEnabled } from "./demoMode";

// Import all API functions
import { fetchBookings, createBooking, updateBooking, deleteBooking } from "../api/bookings";
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from "../api/customers";
import { fetchDrivers, createDriver, updateDriver, deleteDriver } from "../api/drivers";
import { fetchVehicles } from "../api/vehicles.supabase";
import { fetchInvoices, createInvoice, updateInvoice, deleteInvoice } from "../api/invoices";
import { fetchPartners, createPartner, updatePartner, deletePartner } from "../api/partners";
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from "../api/expenses";
import { fetchIncome, createIncome, updateIncome, deleteIncome } from "../api/income";
import { fetchEstimations, createEstimation, updateEstimation, deleteEstimation } from "../api/estimations";
import { fetchNotifications, createNotification, markNotificationAsRead, deleteNotification } from "../api/notifications";
import { addActivityLog as apiAddActivityLog } from "../api/activityHistory";
import { fetchSettings, saveSettings } from "../api/settings";

/**
 * Unified data fetching that works in both demo and production modes
 */
export const dataIntegration = {
  // Bookings
  async getBookings() {
    return await fetchBookings();
  },
  
  async addBooking(bookingData) {
    return await createBooking(bookingData);
  },
  
  async updateBooking(id, bookingData) {
    return await updateBooking(id, bookingData);
  },
  
  async deleteBooking(id) {
    return await deleteBooking(id);
  },

  // Customers
  async getCustomers() {
    return await fetchCustomers();
  },
  
  async addCustomer(customerData) {
    return await createCustomer(customerData);
  },
  
  async updateCustomer(id, customerData) {
    return await updateCustomer(id, customerData);
  },
  
  async deleteCustomer(id) {
    return await deleteCustomer(id);
  },

  // Drivers
  async getDrivers() {
    return await fetchDrivers();
  },
  
  async addDriver(driverData) {
    return await createDriver(driverData);
  },
  
  async updateDriver(id, driverData) {
    return await updateDriver(id, driverData);
  },
  
  async deleteDriver(id) {
    return await deleteDriver(id);
  },

  // Vehicles
  async getVehicles() {
    return await fetchVehicles();
  },

  // Invoices
  async getInvoices() {
    return await fetchInvoices();
  },
  
  async addInvoice(invoiceData) {
    return await createInvoice(invoiceData);
  },
  
  async updateInvoice(id, invoiceData) {
    return await updateInvoice(id, invoiceData);
  },
  
  async deleteInvoice(id) {
    return await deleteInvoice(id);
  },

  // Partners
  async getPartners() {
    return await fetchPartners();
  },
  
  async addPartner(partnerData) {
    return await createPartner(partnerData);
  },
  
  async updatePartner(id, partnerData) {
    return await updatePartner(id, partnerData);
  },
  
  async deletePartner(id) {
    return await deletePartner(id);
  },

  // Expenses
  async getExpenses() {
    return await fetchExpenses();
  },
  
  async addExpense(expenseData) {
    return await createExpense(expenseData);
  },
  
  async updateExpense(id, expenseData) {
    return await updateExpense(id, expenseData);
  },
  
  async deleteExpense(id) {
    return await deleteExpense(id);
  },

  // Income
  async getIncome() {
    return await fetchIncome();
  },
  
  async addIncome(incomeData) {
    return await createIncome(incomeData);
  },
  
  async updateIncome(id, incomeData) {
    return await updateIncome(id, incomeData);
  },
  
  async deleteIncome(id) {
    return await deleteIncome(id);
  },

  // Estimations
  async getEstimations() {
    return await fetchEstimations();
  },
  
  async addEstimation(estimationData) {
    return await createEstimation(estimationData);
  },
  
  async updateEstimation(id, estimationData) {
    return await updateEstimation(id, estimationData);
  },
  
  async deleteEstimation(id) {
    return await deleteEstimation(id);
  },

  // Notifications
  async getNotifications() {
    return await fetchNotifications();
  },
  
  async addNotification(notificationData) {
    return await createNotification(notificationData);
  },
  
  async markNotificationRead(id) {
    return await markNotificationAsRead(id);
  },
  
  async deleteNotification(id) {
    return await deleteNotification(id);
  },

  // Activity Log
  async logActivity(activity) {
    return await apiAddActivityLog(activity);
  },

  // Settings
  async getSettings() {
    return await fetchSettings();
  },
  
  async saveSettings(settingsData) {
    return await saveSettings(settingsData);
  },

  // Utility functions
  isDemoMode() {
    return isDemoModeEnabled();
  }
};

export default dataIntegration;