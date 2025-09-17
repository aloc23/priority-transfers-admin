import React, { createContext, useContext, useState, useEffect } from "react";
import { formatCurrency, EURO_PRICE_PER_BOOKING } from "../utils/currency";
import { sendDriverConfirmationEmail, generateBookingConfirmationHTML } from "../utils/email";

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

    // Load new data models
    const storedPartners = safeLocalStorage.getItem("partners");
    if (storedPartners) {
      try {
        setPartners(JSON.parse(storedPartners));
      } catch (error) {
        console.warn('Failed to parse stored partners data:', error);
        initializePartners();
      }
    } else {
      initializePartners();
    }

    const storedExpenses = safeLocalStorage.getItem("expenses");
    if (storedExpenses) {
      try {
        setExpenses(JSON.parse(storedExpenses));
      } catch (error) {
        console.warn('Failed to parse stored expenses data:', error);
        initializeExpenses();
      }
    } else {
      initializeExpenses();
    }

    const storedIncome = safeLocalStorage.getItem("income");
    if (storedIncome) {
      try {
        setIncome(JSON.parse(storedIncome));
      } catch (error) {
        console.warn('Failed to parse stored income data:', error);
        initializeIncome();
      }
    } else {
      initializeIncome();
    }

    const storedEstimations = safeLocalStorage.getItem("estimations");
    if (storedEstimations) {
      try {
        setEstimations(JSON.parse(storedEstimations));
      } catch (error) {
        console.warn('Failed to parse stored estimations data:', error);
        initializeEstimations();
      }
    } else {
      initializeEstimations();
    }
  }, []);

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
    const sampleDrivers = [
      { id: 1, name: "Mike Johnson", email: "mike@example.com", license: "D123456", phone: "555-0201", status: "available", rating: 4.8 },
      { id: 2, name: "Sarah Wilson", email: "sarah@example.com", license: "D789012", phone: "555-0202", status: "busy", rating: 4.9 },
      { id: 3, name: "Tom Brown", email: "tom@example.com", license: "D345678", phone: "555-0203", status: "available", rating: 4.7 }
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
    // Initialize with some sample invoices for testing the payment flow
    const sampleInvoices = [
      {
        id: 1001,
        customer: "John Doe",
        customerEmail: "john@example.com",
        amount: 45,
        date: "2024-01-15",
        dueDate: "2024-02-14",
        status: "sent",
        type: "priority",
        items: [{ description: "Priority Transfer Service", quantity: 1, rate: 45, amount: 45 }],
        editable: false
      },
      {
        id: 1002,
        customer: "Jane Smith",
        customerEmail: "jane@example.com",
        amount: 32.25,
        date: "2024-01-16",
        dueDate: "2024-02-15",
        status: "pending",
        type: "outsourced",
        items: [{ description: "Outsourced Transfer Service", quantity: 1, rate: 32.25, amount: 32.25 }],
        editable: false
      },
      {
        id: 1003,
        customer: "Business Corp",
        customerEmail: "billing@businesscorp.com",
        amount: 90,
        date: "2024-01-10",
        dueDate: "2024-02-09",
        status: "sent",
        type: "priority",
        items: [{ description: "Corporate Transfer Service", quantity: 2, rate: 45, amount: 90 }],
        editable: false
      }
    ];
    setInvoices(sampleInvoices);
    safeLocalStorage.setItem("invoices", JSON.stringify(sampleInvoices));
  };

  const initializePartners = () => {
    const samplePartners = [
      { 
        id: 1, 
        name: "City Cab Co.", 
        contact: "John Smith", 
        phone: "555-0401", 
        email: "john@citycab.com",
        status: "active", 
        rating: 4.5,
        address: "123 Main St, City",
        completedBookings: 23,
        totalRevenue: 1250,
        commissionRate: 15,
        paymentTerms: "NET30",
        contractStart: "2024-01-01",
        contractEnd: "2024-12-31"
      },
      { 
        id: 2, 
        name: "Express Rides", 
        contact: "Sarah Jones", 
        phone: "555-0402", 
        email: "sarah@expressrides.com",
        status: "active", 
        rating: 4.2,
        address: "456 Oak Ave, City",
        completedBookings: 18,
        totalRevenue: 980,
        commissionRate: 12,
        paymentTerms: "NET15",
        contractStart: "2024-02-01",
        contractEnd: "2024-12-31"
      },
      { 
        id: 3, 
        name: "Metro Transport", 
        contact: "Mike Wilson", 
        phone: "555-0403", 
        email: "mike@metrotransport.com",
        status: "inactive", 
        rating: 3.8,
        address: "789 Pine St, City",
        completedBookings: 8,
        totalRevenue: 420,
        commissionRate: 18,
        paymentTerms: "NET30",
        contractStart: "2023-06-01",
        contractEnd: "2024-05-31"
      }
    ];
    setPartners(samplePartners);
    safeLocalStorage.setItem("partners", JSON.stringify(samplePartners));
  };

  const initializeExpenses = () => {
    const sampleExpenses = [
      {
        id: 1,
        date: "2024-01-15",
        description: "Fuel for Fleet Vehicle ABC123",
        category: "fuel",
        amount: 85.50,
        type: "internal",
        vehicle: "ABC123",
        driver: "Mike Johnson",
        receipt: "REC-001",
        status: "approved"
      },
      {
        id: 2,
        date: "2024-01-16",
        description: "Partner Commission - City Cab Co.",
        category: "outsourced_commission",
        amount: 12.75,
        type: "outsourced",
        partner: "City Cab Co.",
        bookingId: 1,
        invoice: "INV-CC-001",
        status: "pending"
      },
      {
        id: 3,
        date: "2024-01-17",
        description: "Vehicle Maintenance - Honda Accord",
        category: "maintenance",
        amount: 150.00,
        type: "internal",
        vehicle: "XYZ789",
        service: "Oil change and inspection",
        vendor: "Auto Service Plus",
        status: "approved"
      }
    ];
    setExpenses(sampleExpenses);
    safeLocalStorage.setItem("expenses", JSON.stringify(sampleExpenses));
  };

  const initializeIncome = () => {
    const sampleIncome = [
      {
        id: 1,
        date: "2024-01-15",
        description: "Priority Transfer - John Doe",
        category: "priority_transfer",
        amount: 45.00,
        type: "internal",
        customer: "John Doe",
        bookingId: 1,
        driver: "Mike Johnson",
        vehicle: "ABC123",
        status: "received",
        paymentMethod: "credit_card"
      },
      {
        id: 2,
        date: "2024-01-16",
        description: "Outsourced Transfer Revenue Share",
        category: "outsourced_share",
        amount: 32.25,
        type: "outsourced",
        partner: "City Cab Co.",
        bookingId: 2,
        originalAmount: 45.00,
        commissionRate: 15,
        status: "received",
        paymentMethod: "bank_transfer"
      }
    ];
    setIncome(sampleIncome);
    safeLocalStorage.setItem("income", JSON.stringify(sampleIncome));
  };

  const initializeEstimations = () => {
    const sampleEstimations = [
      {
        id: 1,
        date: "2024-01-18",
        customer: "Corporate Client A",
        customerEmail: "procurement@corporatea.com",
        fromAddress: "Airport Terminal 2",
        toAddress: "Downtown Conference Center",
        distance: 15.5,
        estimatedDuration: 25,
        serviceType: "priority",
        vehicleType: "luxury",
        basePrice: 65.00,
        additionalFees: 10.00,
        totalPrice: 75.00,
        status: "pending",
        validUntil: "2024-01-25",
        notes: "VIP client - requires luxury vehicle",
        createdBy: "Admin User"
      },
      {
        id: 2,
        date: "2024-01-19",
        customer: "Event Organizer B",
        customerEmail: "logistics@eventorg.com",
        fromAddress: "Hotel Grand Plaza",
        toAddress: "Convention Center",
        distance: 8.2,
        estimatedDuration: 15,
        serviceType: "standard",
        vehicleType: "standard",
        basePrice: 35.00,
        additionalFees: 5.00,
        totalPrice: 40.00,
        status: "approved",
        validUntil: "2024-01-26",
        notes: "Multiple trips may be required",
        createdBy: "Admin User"
      }
    ];
    setEstimations(sampleEstimations);
    safeLocalStorage.setItem("estimations", JSON.stringify(sampleEstimations));
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
    const bookingPrice = booking.price || booking.amount || EURO_PRICE_PER_BOOKING;
    const invoice = {
      id: `INV-${Date.now()}`,
      bookingId: booking.id,
      customer: booking.customer,
      customerEmail: customers.find(c => c.name === booking.customer)?.email || '',
      date: new Date().toISOString().split('T')[0],
      serviceDate: booking.date,
      pickup: booking.pickup,
      destination: booking.destination,
      amount: bookingPrice,
      status: 'pending',
      type: booking.type || 'priority',
      editable: true,
      items: [
        {
          description: `Transfer service from ${booking.pickup} to ${booking.destination}`,
          quantity: 1,
          rate: bookingPrice,
          amount: bookingPrice
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
      // Auto-create customer if they don't exist
      const existingCustomer = customers.find(c => c.name === invoiceData.customer);
      if (!existingCustomer && invoiceData.customer) {
        const newCustomer = {
          id: Date.now(),
          name: invoiceData.customer,
          email: invoiceData.customerEmail || '',
          phone: '',
          totalBookings: 0,
          totalSpent: 0,
          status: 'active',
          lastBooking: new Date().toISOString().split('T')[0]
        };
        const updatedCustomers = [...customers, newCustomer];
        setCustomers(updatedCustomers);
        safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
        
        addActivityLog({
          type: 'customer_auto_created',
          description: `Customer ${invoiceData.customer} automatically created from invoice`,
          relatedId: newCustomer.id
        });
      }

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
      
      // Sync invoice data with customer records
      syncInvoiceData(invoice.id);
      
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
      // All new bookings start as "pending" regardless of input
      const newBooking = { 
        ...booking, 
        id: Date.now(), 
        type: booking.type || "priority",
        status: "pending", // Force all new bookings to pending status
        // Add completion tracking for pickup and return legs
        pickupCompleted: false,
        returnCompleted: false
      };
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      safeLocalStorage.setItem("bookings", JSON.stringify(updatedBookings));
      
      // Auto-create customer if they don't exist
      const customerName = newBooking.customer;
      const customer = customers.find(c => c.name === customerName);
      if (customer) {
        const updatedCustomers = customers.map(c => 
          c.name === customerName ? { ...c, totalBookings: c.totalBookings + 1 } : c
        );
        setCustomers(updatedCustomers);
        safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
      } else if (customerName) {
        // Create new customer
        const newCustomer = {
          id: Date.now(),
          name: customerName,
          email: booking.customerEmail || '',
          phone: booking.customerPhone || '',
          totalBookings: 1,
          totalSpent: 0,
          status: 'active',
          lastBooking: newBooking.date
        };
        const updatedCustomers = [...customers, newCustomer];
        setCustomers(updatedCustomers);
        safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
        
        addActivityLog({
          type: 'customer_auto_created',
          description: `Customer ${customerName} automatically created from booking`,
          relatedId: newCustomer.id
        });
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
      
      // Auto-generate draft invoice if booking status changed to confirmed and no invoice exists
      if (updates.status === 'confirmed' && oldBooking.status === 'pending') {
        const existingInvoice = invoices.find(inv => inv.bookingId === id);
        if (!existingInvoice) {
          generateInvoiceFromBooking(updatedBooking);
        }
      }
      
      // Sync invoice price if booking price was updated
      if (updates.price !== undefined && updates.price !== oldBooking.price) {
        const relatedInvoice = invoices.find(inv => inv.bookingId === id);
        if (relatedInvoice) {
          const newPrice = updates.price || EURO_PRICE_PER_BOOKING;
          const updatedInvoices = invoices.map(inv => 
            inv.bookingId === id ? {
              ...inv,
              amount: newPrice,
              items: inv.items.map(item => ({
                ...item,
                rate: newPrice,
                amount: newPrice
              }))
            } : inv
          );
          setInvoices(updatedInvoices);
          safeLocalStorage.setItem("invoices", JSON.stringify(updatedInvoices));
          
          addActivityLog({
            type: 'invoice_price_synced',
            description: `Invoice price updated to ${formatCurrency(newPrice)} for booking ${id}`,
            relatedId: relatedInvoice.id
          });
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

  // New workflow-specific functions
  const confirmBooking = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return { success: false, error: 'Booking not found' };
      
      const updatedBooking = { ...booking, status: 'confirmed' };
      const updatedBookings = bookings.map(b => 
        b.id === bookingId ? updatedBooking : b
      );
      setBookings(updatedBookings);
      safeLocalStorage.setItem("bookings", JSON.stringify(updatedBookings));
      
      // Generate draft invoice for confirmed booking
      const existingInvoice = invoices.find(inv => inv.bookingId === bookingId);
      if (!existingInvoice) {
        generateInvoiceFromBooking(updatedBooking);
      }
      
      // Send confirmation email to driver if driver is assigned
      let emailResult = null;
      if (updatedBooking.driver) {
        const driver = drivers.find(d => d.name === updatedBooking.driver);
        if (driver && driver.email) {
          // Demo JWT token - in a real app, this would come from the authenticated user
          const demoSupabaseJwt = 'demo-jwt-token-would-be-from-authenticated-user';
          
          const subject = 'Booking Confirmation - Priority Transfers';
          const html = generateBookingConfirmationHTML(updatedBooking, driver.name);
          
          emailResult = await sendDriverConfirmationEmail({
            to: driver.email,
            subject,
            html,
            supabaseJwt: demoSupabaseJwt
          });
          
          if (emailResult.success) {
            console.log(`✅ Driver confirmation email sent successfully to ${driver.email}`);
            
            addActivityLog({
              type: 'email_sent',
              description: `Driver confirmation email sent to ${driver.name} (${driver.email})`,
              relatedId: bookingId
            });
          } else {
            console.error(`❌ Failed to send driver confirmation email to ${driver.email}:`, emailResult.error);
            
            addActivityLog({
              type: 'email_failed',
              description: `Failed to send driver confirmation email to ${driver.name} (${driver.email}): ${emailResult.error}`,
              relatedId: bookingId
            });
          }
        } else {
          console.warn(`⚠️  Driver ${updatedBooking.driver} not found or has no email address`);
        }
      }
      
      addActivityLog({
        type: 'booking_confirmed',
        description: `Booking confirmed for ${updatedBooking.customer} - Draft invoice created${emailResult?.success ? ' - Driver notification sent' : ''}`,
        relatedId: bookingId
      });
      
      return { 
        success: true, 
        emailSent: emailResult?.success || false,
        emailError: emailResult?.success ? null : emailResult?.error
      };
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      return { success: false, error: 'Failed to confirm booking' };
    }
  };

  const markBookingCompleted = (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return { success: false, error: 'Booking not found' };
      
      const updatedBooking = { ...booking, status: 'completed' };
      const updatedBookings = bookings.map(b => 
        b.id === bookingId ? updatedBooking : b
      );
      setBookings(updatedBookings);
      safeLocalStorage.setItem("bookings", JSON.stringify(updatedBookings));
      
      addActivityLog({
        type: 'booking_completed',
        description: `Booking completed for ${updatedBooking.customer}`,
        relatedId: bookingId
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to mark booking completed:', error);
      return { success: false, error: 'Failed to mark booking completed' };
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
      const invoice = invoices.find(inv => inv.id === id);
      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id ? { 
          ...invoice, 
          status: 'paid',
          paidDate: paymentDate
        } : invoice
      );
      setInvoices(updatedInvoices);
      safeLocalStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      // Auto-create corresponding income entry
      const incomeEntry = {
        id: Date.now(),
        date: paymentDate.split('T')[0],
        description: `Payment received for invoice ${id} - ${invoice.customer}`,
        category: invoice.type === 'outsourced' ? 'outsourced_payment' : 'priority_transfer',
        amount: invoice.amount,
        type: invoice.type || 'priority',
        customer: invoice.customer,
        invoiceId: id,
        paymentMethod: 'credit_card', // Default payment method
        status: 'received'
      };
      
      const updatedIncome = [...income, incomeEntry];
      setIncome(updatedIncome);
      safeLocalStorage.setItem("income", JSON.stringify(updatedIncome));
      
      addActivityLog({
        type: 'payment_received',
        description: `Payment received for invoice ${id}`,
        relatedId: id
      });
      
      addActivityLog({
        type: 'income_created',
        description: `Income entry created from invoice payment: ${invoice.customer}`,
        relatedId: incomeEntry.id
      });
      
      addNotification({
        title: 'Payment Received',
        message: `Payment for invoice ${id} has been recorded`,
        type: 'success'
      });
      
      // Sync payment data with customer records
      syncInvoiceData(id);
      
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

  // Enhanced sync function to update related data when invoices change
  const syncInvoiceData = (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) return { success: false, error: 'Invoice not found' };

      // Update customer's total spent and invoice count
      const customerName = invoice.customer;
      const customer = customers.find(c => c.name === customerName);
      if (customer) {
        const customerInvoices = invoices.filter(inv => inv.customer === customerName);
        const paidInvoices = customerInvoices.filter(inv => inv.status === 'paid');
        
        // Recalculate total spent from all paid invoices
        const totalSpentFromInvoices = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        
        const updatedCustomers = customers.map(c => 
          c.name === customerName ? { 
            ...c, 
            totalInvoices: customerInvoices.length,
            totalSpent: totalSpentFromInvoices,
            lastInvoice: invoice.date
          } : c
        );
        setCustomers(updatedCustomers);
        safeLocalStorage.setItem("customers", JSON.stringify(updatedCustomers));
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to sync invoice data:', error);
      return { success: false, error: 'Failed to sync invoice data' };
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
              .reduce((sum, b) => sum + (b.price || b.amount || EURO_PRICE_PER_BOOKING), 0)
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
      setPartners([]);
      setExpenses([]);
      setIncome([]);
      setEstimations([]);
      
      // Clear localStorage
      safeLocalStorage.removeItem("bookings");
      safeLocalStorage.removeItem("customers");
      safeLocalStorage.removeItem("drivers");
      safeLocalStorage.removeItem("vehicles");
      safeLocalStorage.removeItem("invoices");
      safeLocalStorage.removeItem("activityHistory");
      safeLocalStorage.removeItem("notifications");
      safeLocalStorage.removeItem("partners");
      safeLocalStorage.removeItem("expenses");
      safeLocalStorage.removeItem("income");
      safeLocalStorage.removeItem("estimations");
      
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
      initializePartners();
      initializeExpenses();
      initializeIncome();
      initializeEstimations();
      
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

  const refreshAllData = () => {
    try {
      // Force reload all data from localStorage to sync any inconsistencies
      const bookingsData = safeLocalStorage.getItem("bookings");
      const customersData = safeLocalStorage.getItem("customers");
      const driversData = safeLocalStorage.getItem("drivers");
      const vehiclesData = safeLocalStorage.getItem("vehicles");
      const invoicesData = safeLocalStorage.getItem("invoices");
      const activityData = safeLocalStorage.getItem("activityHistory");
      const notificationsData = safeLocalStorage.getItem("notifications");
      const partnersData = safeLocalStorage.getItem("partners");
      const expensesData = safeLocalStorage.getItem("expenses");
      const incomeData = safeLocalStorage.getItem("income");
      const estimationsData = safeLocalStorage.getItem("estimations");

      // Refresh all state with latest data from storage
      if (bookingsData) setBookings(JSON.parse(bookingsData));
      if (customersData) setCustomers(JSON.parse(customersData));
      if (driversData) setDrivers(JSON.parse(driversData));
      if (vehiclesData) setVehicles(JSON.parse(vehiclesData));
      if (invoicesData) setInvoices(JSON.parse(invoicesData));
      if (activityData) setActivityHistory(JSON.parse(activityData));
      if (notificationsData) setNotifications(JSON.parse(notificationsData));
      if (partnersData) setPartners(JSON.parse(partnersData));
      if (expensesData) setExpenses(JSON.parse(expensesData));
      if (incomeData) setIncome(JSON.parse(incomeData));
      if (estimationsData) setEstimations(JSON.parse(estimationsData));

      addActivityLog({
        type: 'data_refresh',
        description: 'All KPI and analytics data refreshed successfully',
        relatedId: null
      });
      
      return { success: true, message: 'All data refreshed successfully. KPIs and analytics updated.' };
    } catch (error) {
      console.error('Failed to refresh data:', error);
      return { success: false, error: 'Failed to refresh data' };
    }
  };

  const resendInvoice = (id) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      return sendInvoice(id, invoice.customerEmail);
    }
    return { success: false, error: 'Invoice not found' };
  };

  // Partners CRUD operations
  const addPartner = (partnerData) => {
    try {
      const newPartner = { 
        ...partnerData, 
        id: Date.now(), 
        status: partnerData.status || "active",
        rating: partnerData.rating || 5.0,
        completedBookings: 0,
        totalRevenue: 0
      };
      const updatedPartners = [...partners, newPartner];
      setPartners(updatedPartners);
      safeLocalStorage.setItem("partners", JSON.stringify(updatedPartners));
      
      addActivityLog({
        type: 'partner_created',
        description: `New partner ${newPartner.name} added`,
        relatedId: newPartner.id
      });
      
      return { success: true, partner: newPartner };
    } catch (error) {
      console.error('Failed to add partner:', error);
      return { success: false, error: 'Failed to create partner' };
    }
  };

  const updatePartner = (id, updates) => {
    try {
      const updatedPartners = partners.map(partner => 
        partner.id === id ? { ...partner, ...updates } : partner
      );
      setPartners(updatedPartners);
      safeLocalStorage.setItem("partners", JSON.stringify(updatedPartners));
      
      addActivityLog({
        type: 'partner_updated',
        description: `Partner ${updates.name || 'information'} updated`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update partner:', error);
      return { success: false, error: 'Failed to update partner' };
    }
  };

  const deletePartner = (id) => {
    try {
      const partner = partners.find(p => p.id === id);
      const updatedPartners = partners.filter(partner => partner.id !== id);
      setPartners(updatedPartners);
      safeLocalStorage.setItem("partners", JSON.stringify(updatedPartners));
      
      addActivityLog({
        type: 'partner_deleted',
        description: `Partner ${partner?.name || id} deleted`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete partner:', error);
      return { success: false, error: 'Failed to delete partner' };
    }
  };

  // Expenses CRUD operations
  const addExpense = (expenseData) => {
    try {
      const newExpense = { 
        ...expenseData, 
        id: Date.now(),
        date: expenseData.date || new Date().toISOString().split('T')[0],
        status: expenseData.status || "pending"
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      safeLocalStorage.setItem("expenses", JSON.stringify(updatedExpenses));
      
      addActivityLog({
        type: 'expense_created',
        description: `New expense: ${newExpense.description}`,
        relatedId: newExpense.id
      });
      
      return { success: true, expense: newExpense };
    } catch (error) {
      console.error('Failed to add expense:', error);
      return { success: false, error: 'Failed to create expense' };
    }
  };

  const updateExpense = (id, updates) => {
    try {
      const updatedExpenses = expenses.map(expense => 
        expense.id === id ? { ...expense, ...updates } : expense
      );
      setExpenses(updatedExpenses);
      safeLocalStorage.setItem("expenses", JSON.stringify(updatedExpenses));
      
      addActivityLog({
        type: 'expense_updated',
        description: `Expense updated: ${updates.description || 'details'}`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update expense:', error);
      return { success: false, error: 'Failed to update expense' };
    }
  };

  const deleteExpense = (id) => {
    try {
      const expense = expenses.find(e => e.id === id);
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      safeLocalStorage.setItem("expenses", JSON.stringify(updatedExpenses));
      
      addActivityLog({
        type: 'expense_deleted',
        description: `Expense deleted: ${expense?.description || id}`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete expense:', error);
      return { success: false, error: 'Failed to delete expense' };
    }
  };

  // Income CRUD operations
  const addIncome = (incomeData) => {
    try {
      const newIncome = { 
        ...incomeData, 
        id: Date.now(),
        date: incomeData.date || new Date().toISOString().split('T')[0],
        status: incomeData.status || "received"
      };
      const updatedIncome = [...income, newIncome];
      setIncome(updatedIncome);
      safeLocalStorage.setItem("income", JSON.stringify(updatedIncome));
      
      addActivityLog({
        type: 'income_created',
        description: `New income: ${newIncome.description}`,
        relatedId: newIncome.id
      });
      
      return { success: true, income: newIncome };
    } catch (error) {
      console.error('Failed to add income:', error);
      return { success: false, error: 'Failed to create income' };
    }
  };

  const updateIncome = (id, updates) => {
    try {
      const updatedIncome = income.map(inc => 
        inc.id === id ? { ...inc, ...updates } : inc
      );
      setIncome(updatedIncome);
      safeLocalStorage.setItem("income", JSON.stringify(updatedIncome));
      
      addActivityLog({
        type: 'income_updated',
        description: `Income updated: ${updates.description || 'details'}`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update income:', error);
      return { success: false, error: 'Failed to update income' };
    }
  };

  const deleteIncome = (id) => {
    try {
      const inc = income.find(i => i.id === id);
      const updatedIncome = income.filter(inc => inc.id !== id);
      setIncome(updatedIncome);
      safeLocalStorage.setItem("income", JSON.stringify(updatedIncome));
      
      addActivityLog({
        type: 'income_deleted',
        description: `Income deleted: ${inc?.description || id}`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete income:', error);
      return { success: false, error: 'Failed to delete income' };
    }
  };

  // Estimations CRUD operations
  const addEstimation = (estimationData) => {
    try {
      const newEstimation = { 
        ...estimationData, 
        id: Date.now(),
        date: estimationData.date || new Date().toISOString().split('T')[0],
        status: estimationData.status || "pending",
        createdBy: currentUser?.name || "System"
      };
      const updatedEstimations = [...estimations, newEstimation];
      setEstimations(updatedEstimations);
      safeLocalStorage.setItem("estimations", JSON.stringify(updatedEstimations));
      
      addActivityLog({
        type: 'estimation_created',
        description: `New estimation for ${newEstimation.customer}`,
        relatedId: newEstimation.id
      });
      
      return { success: true, estimation: newEstimation };
    } catch (error) {
      console.error('Failed to add estimation:', error);
      return { success: false, error: 'Failed to create estimation' };
    }
  };

  const updateEstimation = (id, updates) => {
    try {
      const updatedEstimations = estimations.map(estimation => 
        estimation.id === id ? { ...estimation, ...updates } : estimation
      );
      setEstimations(updatedEstimations);
      safeLocalStorage.setItem("estimations", JSON.stringify(updatedEstimations));
      
      addActivityLog({
        type: 'estimation_updated',
        description: `Estimation updated for ${updates.customer || 'customer'}`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update estimation:', error);
      return { success: false, error: 'Failed to update estimation' };
    }
  };

  const deleteEstimation = (id) => {
    try {
      const estimation = estimations.find(e => e.id === id);
      const updatedEstimations = estimations.filter(estimation => estimation.id !== id);
      setEstimations(updatedEstimations);
      safeLocalStorage.setItem("estimations", JSON.stringify(updatedEstimations));
      
      addActivityLog({
        type: 'estimation_deleted',
        description: `Estimation deleted for ${estimation?.customer || id}`,
        relatedId: id
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete estimation:', error);
      return { success: false, error: 'Failed to delete estimation' };
    }
  };

  // Global calendar state management functions
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

  const convertEstimationToBooking = (estimationId) => {
    try {
      const estimation = estimations.find(e => e.id === estimationId);
      if (!estimation) {
        return { success: false, error: 'Estimation not found' };
      }

      // Create booking from estimation
      const bookingData = {
        customer: estimation.customer,
        pickup: estimation.fromAddress,
        destination: estimation.toAddress,
        date: new Date().toISOString().split('T')[0],
        time: "09:00", // Default time
        status: "confirmed",
        type: estimation.serviceType,
        amount: estimation.totalPrice,
        estimationId: estimationId
      };

      const bookingResult = addBooking(bookingData);
      
      if (bookingResult.success) {
        // Update estimation status
        updateEstimation(estimationId, { 
          status: "converted",
          convertedToBookingId: bookingResult.booking.id
        });

        addActivityLog({
          type: 'estimation_converted',
          description: `Estimation converted to booking for ${estimation.customer}`,
          relatedId: estimationId
        });

        return { success: true, booking: bookingResult.booking };
      }

      return bookingResult;
    } catch (error) {
      console.error('Failed to convert estimation to booking:', error);
      return { success: false, error: 'Failed to convert estimation' };
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
    login,
    logout,
    addBooking,
    updateBooking,
    deleteBooking,
    confirmBooking,
    markBookingCompleted,
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
    refreshAllData,
    markInvoiceAsPaid,
    sendBookingReminder,
    syncBookingData,
    syncInvoiceData,
    // New CRUD operations
    addPartner,
    updatePartner,
    deletePartner,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    addEstimation,
    updateEstimation,
    deleteEstimation,
    convertEstimationToBooking,
    updateGlobalCalendarState,
    resetGlobalCalendarFilters
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}