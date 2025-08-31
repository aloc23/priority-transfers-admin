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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const storedBookings = localStorage.getItem("bookings");
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    } else {
      // Initialize with sample data
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
          vehicle: "Toyota Camry"
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
          vehicle: "Honda Accord"
        }
      ];
      setBookings(sampleBookings);
      localStorage.setItem("bookings", JSON.stringify(sampleBookings));
    }

    const storedCustomers = localStorage.getItem("customers");
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    } else {
      const sampleCustomers = [
        { id: 1, name: "John Doe", email: "john@example.com", phone: "555-0101", totalBookings: 15 },
        { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "555-0102", totalBookings: 8 },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "555-0103", totalBookings: 22 }
      ];
      setCustomers(sampleCustomers);
      localStorage.setItem("customers", JSON.stringify(sampleCustomers));
    }

    const storedDrivers = localStorage.getItem("drivers");
    if (storedDrivers) {
      setDrivers(JSON.parse(storedDrivers));
    } else {
      const sampleDrivers = [
        { id: 1, name: "Mike Johnson", license: "D123456", phone: "555-0201", status: "available", rating: 4.8 },
        { id: 2, name: "Sarah Wilson", license: "D789012", phone: "555-0202", status: "busy", rating: 4.9 },
        { id: 3, name: "Tom Brown", license: "D345678", phone: "555-0203", status: "available", rating: 4.7 }
      ];
      setDrivers(sampleDrivers);
      localStorage.setItem("drivers", JSON.stringify(sampleDrivers));
    }

    const storedVehicles = localStorage.getItem("vehicles");
    if (storedVehicles) {
      setVehicles(JSON.parse(storedVehicles));
    } else {
      const sampleVehicles = [
        { id: 1, make: "Toyota", model: "Camry", year: 2022, license: "ABC123", status: "active", driver: "Mike Johnson" },
        { id: 2, make: "Honda", model: "Accord", year: 2021, license: "XYZ789", status: "active", driver: "Sarah Wilson" },
        { id: 3, make: "Ford", model: "Fusion", year: 2020, license: "DEF456", status: "maintenance", driver: "Tom Brown" }
      ];
      setVehicles(sampleVehicles);
      localStorage.setItem("vehicles", JSON.stringify(sampleVehicles));
    }
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const addBooking = (booking) => {
    const newBooking = { ...booking, id: Date.now() };
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
  };

  const updateBooking = (id, updates) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, ...updates } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
  };

  const deleteBooking = (id) => {
    const updatedBookings = bookings.filter(booking => booking.id !== id);
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
  };

  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now(), totalBookings: 0 };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
  };

  const updateCustomer = (id, updates) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    );
    setCustomers(updatedCustomers);
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
  };

  const deleteCustomer = (id) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
  };

  const addDriver = (driver) => {
    const newDriver = { ...driver, id: Date.now(), status: "available", rating: 5.0 };
    const updatedDrivers = [...drivers, newDriver];
    setDrivers(updatedDrivers);
    localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
  };

  const updateDriver = (id, updates) => {
    const updatedDrivers = drivers.map(driver => 
      driver.id === id ? { ...driver, ...updates } : driver
    );
    setDrivers(updatedDrivers);
    localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
  };

  const deleteDriver = (id) => {
    const updatedDrivers = drivers.filter(driver => driver.id !== id);
    setDrivers(updatedDrivers);
    localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
  };

  const addVehicle = (vehicle) => {
    const newVehicle = { ...vehicle, id: Date.now(), status: "active" };
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
  };

  const updateVehicle = (id, updates) => {
    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...updates } : vehicle
    );
    setVehicles(updatedVehicles);
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
  };

  const deleteVehicle = (id) => {
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    setVehicles(updatedVehicles);
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
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
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const markNotificationRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const value = {
    currentUser,
    bookings,
    customers,
    drivers,
    vehicles,
    notifications,
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
    markNotificationRead
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}