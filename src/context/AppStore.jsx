import React, { createContext, useContext, useState, useEffect } from "react";

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
    const storedUser = safeLocalStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.warn('Failed to parse stored user data:', error);
        safeLocalStorage.removeItem("currentUser");
      }
    }

    const storedBookings = safeLocalStorage.getItem("bookings");
    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch (error) {
        console.warn('Failed to parse stored bookings data:', error);
        initializeBookings();
      }
    } else {
      initializeBookings();
    }

    const storedCustomers = safeLocalStorage.getItem("customers");
    if (storedCustomers) {
      try {
        setCustomers(JSON.parse(storedCustomers));
      } catch (error) {
        console.warn('Failed to parse stored customers data:', error);
        initializeCustomers();
      }
    } else {
      initializeCustomers();
    }

    const storedDrivers = safeLocalStorage.getItem("drivers");
    if (storedDrivers) {
      try {
        setDrivers(JSON.parse(storedDrivers));
      } catch (error) {
        console.warn('Failed to parse stored drivers data:', error);
        initializeDrivers();
      }
    } else {
      initializeDrivers();
    }

    const storedVehicles = safeLocalStorage.getItem("vehicles");
    if (storedVehicles) {
      try {
        setVehicles(JSON.parse(storedVehicles));
      } catch (error) {
        console.warn('Failed to parse stored vehicles data:', error);
        initializeVehicles();
      }
    } else {
      initializeVehicles();
    }

    const storedInvoices = safeLocalStorage.getItem("invoices");
    if (storedInvoices) {
      try {
        setInvoices(JSON.parse(storedInvoices));
      } catch (error) {
        console.warn('Failed to parse stored invoices data:', error);
        initializeInvoices();
      }
    } else {
      initializeInvoices();
    }

    const storedActivityHistory = safeLocalStorage.getItem("activityHistory");
    if (storedActivityHistory) {
      try {
        setActivityHistory(JSON.parse(storedActivityHistory));
      } catch (error) {
        console.warn('Failed to parse stored activity history:', error);
        setActivityHistory([]);
      }
    }
  }, []);

  const initializeBookings = () => {
    const sampleBookings = [
      {
        id: 1,
        customer: "John Doe",
        pickup: "123 Main St",
        destination: "456 Oak Ave",
        date: "2024-01-15",
        time: "09:00",
        status: "confirmed",
        driver: "Mike Johnson",
        vehicle: "Toyota Camry",
        type: "priority"
      },
      {
        id: 2,
        customer: "Jane Smith",
        pickup: "789 Pine St",
        destination: "321 Elm St",
        date: "2024-01-16",
        time: "14:30",
        status: "pending",
        driver: "Sarah Wilson",
        vehicle: "Honda Accord",
        type: "outsourced"
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
    const sampleDrivers = [
      { id: 1, name: "Mike Johnson", license: "D123456", phone: "555-0201", status: "available", rating: 4.8 },
      { id: 2, name: "Sarah Wilson", license: "D789012", phone: "555-0202", status: "busy", rating: 4.9 },
      { id: 3, name: "Tom Brown", license: "D345678", phone: "555-0203", status: "available", rating: 4.7 }
    ];
    setDrivers(sampleDrivers);
    safeLocalStorage.setItem("drivers", JSON.stringify(sampleDrivers));
  };

  const initializeVehicles = () => {
    const sampleVehicles = [
      { id: 1, make: "Toyota", model: "Camry", year: 2022, license: "ABC123", status: "active", driver: "Mike Johnson" },
      { id: 2, make: "Honda", model: "Accord", year: 2021, license: "XYZ789", status: "active", driver: "Sarah Wilson" },
      { id: 3, make: "Ford", model: "Fusion", year: 2020, license: "DEF456", status: "maintenance", driver: "Tom Brown" }
    ];
    setVehicles(sampleVehicles);
    safeLocalStorage.setItem("vehicles", JSON.stringify(sampleVehicles));
  };

  const initializeInvoices = () => {
    // Initialize with some sample invoices based on completed bookings
    const sampleInvoices = [];
    setInvoices(sampleInvoices);
    safeLocalStorage.setItem("invoices", JSON.stringify(sampleInvoices));
  };

  const addActivityLog = (activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activity
    };
    const updatedHistory = [newActivity, ...activityHistory].slice(0, 100); // Keep last 100 activities
    setActivityHistory(updatedHistory);
    safeLocalStorage.setItem("activityHistory", JSON.stringify(updatedHistory));
  };

  const generateInvoiceFromBooking = (booking) => {
    const invoice = {
      id: `INV-${Date.now()}`,
      bookingId: booking.id,
      customer: booking.customer,
      customerEmail: customers.find(c => c.name === booking.customer)?.email || '',
      date: new Date().toISOString().split('T')[0],
      serviceDate: booking.date,
      pickup: booking.pickup,
      destination: booking.destination,
      amount: 45, // Using EURO_PRICE_PER_BOOKING from currency utils
      status: 'pending',
      type: booking.type || 'priority',
      editable: true,
      items: [
        {
          description: `Transfer service from ${booking.pickup} to ${booking.destination}`,
          quantity: 1,
          rate: 45,
          amount: 45
        }
      ]
    };
    
    const updatedInvoices = [...invoices, invoice];
    setInvoices(updatedInvoices);
    safeLocalStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    
    addActivityLog({
      type: 'invoice_generated',
      description: `Invoice ${invoice.id} generated for ${booking.customer}`,
      relatedId: invoice.id
    });
    
    return invoice;
  };

  const addInvoice = (invoiceData) => {
    try {
      const invoice = {
        id: `INV-${Date.now()}`,
        bookingId: null, // Independent invoice not linked to a booking
        customer: invoiceData.customer,
        customerEmail: invoiceData.customerEmail,
        date: new Date().toISOString().split('T')[0],
        serviceDate: invoiceData.serviceDate || new Date().toISOString().split('T')[0],
        pickup: invoiceData.pickup || '',
        destination: invoiceData.destination || '',
        amount: invoiceData.amount,
        status: 'pending',
        type: invoiceData.type || 'priority',
        editable: true,
        items: invoiceData.items || [
          {
            description: invoiceData.description || 'Service provided',
            quantity: 1,
            rate: invoiceData.amount,
            amount: invoiceData.amount
          }
        ]
      };
      
      const updatedInvoices = [...invoices, invoice];
      setInvoices(updatedInvoices);
      safeLocalStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      addActivityLog({
        type: 'invoice_created',
        description: `Independent invoice ${invoice.id} created for ${invoiceData.customer}`,
        relatedId: invoice.id
      });
      
      return { success: true, invoice };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      return { success: false, error: 'Failed to create invoice' };
    }
  };

  const login = (user) => {
    setCurrentUser(user);
    safeLocalStorage.setItem("currentUser", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    safeLocalStorage.removeItem("currentUser");
  };

  const addBooking = (booking) => {
    try {
      const newBooking = { ...booking, id: Date.now(), type: booking.type || "priority" };
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      safeLocalStorage.setItem("bookings", JSON.stringify(updatedBookings));
      
      // Update customer totalBookings count
      const customerName = newBooking.customer;
      const customer = customers.find(c => c.name === customerName);
      if (customer) {
        const updatedCustomers = customers.map(c => 
          c.name === customerName ? { ...c, totalBookings: c.totalBookings + 1 } : c
        );
        setCustomers(updatedCustomers);
        safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
      }
      
      addActivityLog({
        type: 'booking_created',
        description: `New booking created for ${newBooking.customer}`,
        relatedId: newBooking.id
      });
      
      return { success: true, booking: newBooking };
    } catch (error) {
      console.error('Failed to add booking:', error);
      return { success: false, error: 'Failed to save booking' };
    }
  };

  const updateBooking = (id, updates) => {
    try {
      const oldBooking = bookings.find(booking => booking.id === id);
      const updatedBooking = { ...oldBooking, ...updates };
      const updatedBookings = bookings.map(booking => 
        booking.id === id ? updatedBooking : booking
      );
      setBookings(updatedBookings);
      safeLocalStorage.setItem("bookings", JSON.stringify(updatedBookings));
      
      addActivityLog({
        type: 'booking_updated',
        description: `Booking updated for ${updatedBooking.customer}`,
        relatedId: id
      });
      
      // Auto-generate invoice if booking status changed to completed and no invoice exists
      if (updates.status === 'completed' && oldBooking.status !== 'completed') {
        const existingInvoice = invoices.find(inv => inv.bookingId === id);
        if (!existingInvoice) {
          generateInvoiceFromBooking(updatedBooking);
        }
      }
      
      // Sync related data
      syncBookingData(id);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update booking:', error);
      return { success: false, error: 'Failed to update booking' };
    }
  };

  const deleteBooking = (id) => {
    try {
      const updatedBookings = bookings.filter(booking => booking.id !== id);
      setBookings(updatedBookings);
      safeLocalStorage.setItem("bookings", JSON.stringify(updatedBookings));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete booking:', error);
      return { success: false, error: 'Failed to delete booking' };
    }
  };

  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now(), totalBookings: 0 };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
  };

  const updateCustomer = (id, updates) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    );
    setCustomers(updatedCustomers);
    safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
  };

  const deleteCustomer = (id) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
    safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
  };

  const addDriver = (driver) => {
    const newDriver = { ...driver, id: Date.now(), status: "available", rating: 5.0 };
    const updatedDrivers = [...drivers, newDriver];
    setDrivers(updatedDrivers);
    safeLocalStorage.setItem("drivers", JSON.stringify(updatedDrivers));
  };

  const updateDriver = (id, updates) => {
    const updatedDrivers = drivers.map(driver => 
      driver.id === id ? { ...driver, ...updates } : driver
    );
    setDrivers(updatedDrivers);
    safeLocalStorage.setItem("drivers", JSON.stringify(updatedDrivers));
  };

  const deleteDriver = (id) => {
    const updatedDrivers = drivers.filter(driver => driver.id !== id);
    setDrivers(updatedDrivers);
    safeLocalStorage.setItem("drivers", JSON.stringify(updatedDrivers));
  };

  const addVehicle = (vehicle) => {
    const newVehicle = { ...vehicle, id: Date.now(), status: "active" };
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    safeLocalStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
  };

  const updateVehicle = (id, updates) => {
    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...updates } : vehicle
    );
    setVehicles(updatedVehicles);
    safeLocalStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
  };

  const deleteVehicle = (id) => {
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    setVehicles(updatedVehicles);
    safeLocalStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
  };

  const addNotification = (notification) => {
    const newNotification = { 
      ...notification, 
      id: Date.now(), 
      timestamp: new Date().toISOString(),
      read: false 
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    safeLocalStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const markNotificationRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    safeLocalStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const updateInvoice = (id, updates) => {
    try {
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id ? { ...invoice, ...updates } : invoice
      );
      setInvoices(updatedInvoices);
      safeLocalStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      addActivityLog({
        type: 'invoice_updated',
        description: `Invoice ${id} updated`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update invoice:', error);
      return { success: false, error: 'Failed to update invoice' };
    }
  };

  const cancelInvoice = (id) => {
    try {
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id ? { ...invoice, status: 'cancelled', editable: false } : invoice
      );
      setInvoices(updatedInvoices);
      safeLocalStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      addActivityLog({
        type: 'invoice_cancelled',
        description: `Invoice ${id} cancelled`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to cancel invoice:', error);
      return { success: false, error: 'Failed to cancel invoice' };
    }
  };

  const sendInvoice = (id, recipientEmail) => {
    try {
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id ? { 
          ...invoice, 
          status: 'sent', 
          sentDate: new Date().toISOString(),
          sentTo: recipientEmail 
        } : invoice
      );
      setInvoices(updatedInvoices);
      safeLocalStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      addActivityLog({
        type: 'invoice_sent',
        description: `Invoice ${id} sent to ${recipientEmail}`,
        relatedId: id
      });
      
      // Add notification
      addNotification({
        title: 'Invoice Sent',
        message: `Invoice ${id} has been sent to ${recipientEmail}`,
        type: 'success'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send invoice:', error);
      return { success: false, error: 'Failed to send invoice' };
    }
  };

  const markInvoiceAsPaid = (id, paymentDate = new Date().toISOString()) => {
    try {
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id ? { 
          ...invoice, 
          status: 'paid',
          paidDate: paymentDate
        } : invoice
      );
      setInvoices(updatedInvoices);
      safeLocalStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      addActivityLog({
        type: 'payment_received',
        description: `Payment received for invoice ${id}`,
        relatedId: id
      });
      
      addNotification({
        title: 'Payment Received',
        message: `Payment for invoice ${id} has been recorded`,
        type: 'success'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
      return { success: false, error: 'Failed to mark invoice as paid' };
    }
  };

  const sendBookingReminder = (bookingId, reminderType = 'booking_reminder') => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      addActivityLog({
        type: reminderType,
        description: `${reminderType === 'booking_reminder' ? 'Booking reminder' : 'Confirmation'} sent to ${booking.customer}`,
        relatedId: bookingId
      });
      
      addNotification({
        title: 'Reminder Sent',
        message: `${reminderType === 'booking_reminder' ? 'Booking reminder' : 'Confirmation'} sent to ${booking.customer}`,
        type: 'info'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send reminder:', error);
      return { success: false, error: 'Failed to send reminder' };
    }
  };

  // Enhanced sync function to update related data when bookings change
  const syncBookingData = (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      // Update customer's total bookings count
      const customerName = booking.customer;
      const customer = customers.find(c => c.name === customerName);
      if (customer) {
        const customerBookings = bookings.filter(b => b.customer === customerName);
        const updatedCustomers = customers.map(c => 
          c.name === customerName ? { 
            ...c, 
            totalBookings: customerBookings.length,
            lastBooking: booking.date,
            totalSpent: customerBookings
              .filter(b => b.status === 'completed')
              .reduce((sum, b) => sum + (b.amount || EURO_PRICE_PER_BOOKING), 0)
          } : c
        );
        setCustomers(updatedCustomers);
        safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
      }

      // Update driver status if booking is assigned
      if (booking.driver) {
        const driver = drivers.find(d => d.name === booking.driver);
        if (driver) {
          const driverBookings = bookings.filter(b => b.driver === booking.driver);
          const activeBookings = driverBookings.filter(b => ['confirmed', 'in-progress'].includes(b.status));
          
          const updatedDrivers = drivers.map(d => 
            d.name === booking.driver ? { 
              ...d, 
              status: activeBookings.length > 0 ? 'busy' : 'available',
              totalBookings: driverBookings.length,
              completedBookings: driverBookings.filter(b => b.status === 'completed').length
            } : d
          );
          setDrivers(updatedDrivers);
          safeLocalStorage.setItem("drivers", JSON.stringify(updatedDrivers));
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to sync booking data:', error);
      return { success: false, error: 'Failed to sync booking data' };
    }
  };

  const clearDemoData = () => {
    try {
      // Clear all data arrays
      setBookings([]);
      setCustomers([]);
      setDrivers([]);
      setVehicles([]);
      setInvoices([]);
      setActivityHistory([]);
      setNotifications([]);
      
      // Clear localStorage
      safeLocalStorage.removeItem("bookings");
      safeLocalStorage.removeItem("customers");
      safeLocalStorage.removeItem("drivers");
      safeLocalStorage.removeItem("vehicles");
      safeLocalStorage.removeItem("invoices");
      safeLocalStorage.removeItem("activityHistory");
      safeLocalStorage.removeItem("notifications");
      
      addActivityLog({
        type: 'data_cleared',
        description: 'Demo data cleared successfully',
        relatedId: null
      });
      
      return { success: true, message: 'Demo data cleared successfully' };
    } catch (error) {
      console.error('Failed to clear demo data:', error);
      return { success: false, error: 'Failed to clear demo data' };
    }
  };

  const loadRealData = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll create a more realistic dataset
      const realBookings = [
        {
          id: 1001,
          customer: "Executive Transport Ltd",
          pickup: "Downtown Hotel",
          destination: "Airport Terminal 1",
          date: "2024-01-20",
          time: "06:00",
          status: "confirmed",
          driver: "Professional Driver A",
          vehicle: "Mercedes S-Class",
          type: "priority",
          amount: 85
        },
        {
          id: 1002,
          customer: "Corporate Events Inc",
          pickup: "Convention Center",
          destination: "Business District",
          date: "2024-01-21",
          time: "09:30",
          status: "completed",
          driver: "Professional Driver B",
          vehicle: "BMW 7 Series",
          type: "priority",
          amount: 65
        }
      ];
      
      const realCustomers = [
        {
          id: 1001,
          name: "Executive Transport Ltd",
          email: "booking@executivetrans.com",
          phone: "+1-555-0001",
          totalBookings: 45,
          status: "premium"
        },
        {
          id: 1002,
          name: "Corporate Events Inc",
          email: "events@corporate.com",
          phone: "+1-555-0002",
          totalBookings: 23,
          status: "active"
        }
      ];
      
      const realDrivers = [
        {
          id: 1001,
          name: "Professional Driver A",
          license: "CDL-001234",
          phone: "+1-555-1001",
          status: "available",
          rating: 4.9,
          experience: "5+ years"
        },
        {
          id: 1002,
          name: "Professional Driver B",
          license: "CDL-005678",
          phone: "+1-555-1002",
          status: "busy",
          rating: 4.8,
          experience: "3+ years"
        }
      ];
      
      const realVehicles = [
        {
          id: 1001,
          make: "Mercedes",
          model: "S-Class",
          year: 2023,
          license: "LUX-001",
          status: "available",
          driver: "Professional Driver A"
        },
        {
          id: 1002,
          make: "BMW",
          model: "7 Series",
          year: 2022,
          license: "LUX-002",
          status: "in-use",
          driver: "Professional Driver B"
        }
      ];
      
      // Set the real data
      setBookings(realBookings);
      setCustomers(realCustomers);
      setDrivers(realDrivers);
      setVehicles(realVehicles);
      
      // Save to localStorage
      safeLocalStorage.setItem("bookings", JSON.stringify(realBookings));
      safeLocalStorage.setItem("customers", JSON.stringify(realCustomers));
      safeLocalStorage.setItem("drivers", JSON.stringify(realDrivers));
      safeLocalStorage.setItem("vehicles", JSON.stringify(realVehicles));
      
      addActivityLog({
        type: 'data_loaded',
        description: 'Real data loaded successfully',
        relatedId: null
      });
      
      return { success: true, message: 'Real data loaded successfully' };
    } catch (error) {
      console.error('Failed to load real data:', error);
      return { success: false, error: 'Failed to load real data' };
    }
  };

  const resetToDemo = () => {
    try {
      // Clear current data first
      clearDemoData();
      
      // Reinitialize with demo data
      initializeBookings();
      initializeCustomers();
      initializeDrivers();
      initializeVehicles();
      initializeInvoices();
      
      addActivityLog({
        type: 'demo_reset',
        description: 'Reset to demo data',
        relatedId: null
      });
      
      return { success: true, message: 'Reset to demo data successfully' };
    } catch (error) {
      console.error('Failed to reset to demo:', error);
      return { success: false, error: 'Failed to reset to demo data' };
    }
  };

  const resendInvoice = (id) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      return sendInvoice(id, invoice.customerEmail);
    }
    return { success: false, error: 'Invoice not found' };
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
    login,
    logout,
    addBooking,
    updateBooking,
    deleteBooking,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addDriver,
    updateDriver,
    deleteDriver,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addNotification,
    markNotificationRead,
    generateInvoiceFromBooking,
    addInvoice,
    updateInvoice,
    cancelInvoice,
    sendInvoice,
    resendInvoice,
    addActivityLog,
    clearDemoData,
    loadRealData,
    resetToDemo,
    markInvoiceAsPaid,
    sendBookingReminder,
    syncBookingData
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}