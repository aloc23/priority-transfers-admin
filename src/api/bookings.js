import supabase from "../utils/supabaseClient";
import { getSupabaseJWT, isAuthenticated } from "../utils/auth";

// Helper function to check if we're in demo mode (no Supabase session)
async function isDemoMode() {
  // First check for Supabase session
  const authResult = await getSupabaseJWT();
  return !authResult.success;
}

export async function fetchBookings() {
  // Check if we're in demo mode first
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    // In demo mode, try to get bookings from localStorage
    try {
      const bookingsJson = localStorage.getItem("bookings");
      if (bookingsJson) {
        const bookings = JSON.parse(bookingsJson);
        console.log('Demo mode: Loading bookings from localStorage', bookings.length);
        return bookings;
      } else {
        // Initialize demo data if none exists
        console.log('Demo mode: No bookings found, initializing demo data');
        const demoBookings = initializeDemoBookings();
        localStorage.setItem("bookings", JSON.stringify(demoBookings));
        return demoBookings;
      }
    } catch (error) {
      console.error('Error loading bookings from localStorage:', error);
      return [];
    }
  }

  // Real Supabase mode
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      pickup,
      dropoff,
      scheduled_at,
      status,
      customer_id,
      driver_id,
      vehicle_id,
      type,
      source,
      price,
      pickup_completed,
      return_completed,
      notes,
      customers (
        id,
        name,
        email
      ),
      drivers (
        id,
        name,
        email
      ),
      vehicles (
        id,
        make,
        model,
        plate_number
      )
    `)
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("Error fetching bookings:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((b) => ({
    id: b.id,
    customer: b.customers ? b.customers.name : null,
    customerId: b.customer_id,
    pickup: b.pickup,
    destination: b.dropoff,
    date: b.scheduled_at ? b.scheduled_at.split('T')[0] : null,
    time: b.scheduled_at ? b.scheduled_at.split('T')[1]?.substring(0, 5) : null,
    scheduledAt: b.scheduled_at,
    status: b.status,
    driverId: b.driver_id,
    driver: b.drivers ? b.drivers.name : null,
    vehicleId: b.vehicle_id,
    vehicle: b.vehicles ? `${b.vehicles.make} ${b.vehicles.model}` : null,
    type: b.type,
    source: b.source,
    price: b.price,
    pickupCompleted: b.pickup_completed,
    returnCompleted: b.return_completed,
    notes: b.notes
  }));
}

export async function createBooking(bookingData) {
  // Validate required fields before making the API call
  if (!bookingData.pickup?.trim()) {
    return { success: false, error: 'Pickup location is required' };
  }
  
  if (!bookingData.destination && !bookingData.dropoff) {
    return { success: false, error: 'Destination/dropoff location is required' };
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([{
        pickup: bookingData.pickup.trim(),
        dropoff: (bookingData.destination || bookingData.dropoff)?.trim(),
        scheduled_at: bookingData.scheduledAt || `${bookingData.date}T${bookingData.time}:00`,
        status: bookingData.status || "pending",
        customer_id: bookingData.customerId || null,
        driver_id: bookingData.driverId || null,
        vehicle_id: bookingData.vehicleId || null,
        type: bookingData.type || "single",
        source: bookingData.source || "internal",
        price: bookingData.price ? parseFloat(bookingData.price) : null,
        pickup_completed: bookingData.pickupCompleted || false,
        return_completed: bookingData.returnCompleted || false,
        notes: bookingData.notes?.trim() || null
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      
      // Provide specific error messages based on error code
      let errorMessage = "Failed to create booking";
      if (error.code === '23502') { // Not null constraint violation
        errorMessage = "Missing required booking information";
      } else if (error.code === '23503') { // Foreign key constraint violation
        if (error.message.includes('customer_id')) {
          errorMessage = "Invalid customer selected";
        } else if (error.message.includes('driver_id')) {
          errorMessage = "Invalid driver selected";
        } else if (error.message.includes('vehicle_id')) {
          errorMessage = "Invalid vehicle selected";
        } else {
          errorMessage = "Invalid reference data selected";
        }
      } else if (error.message.includes('invalid input')) {
        errorMessage = "Invalid input data provided";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true, booking: data };
  } catch (error) {
    console.error("Network error creating booking:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}

export async function updateBooking(id, bookingData) {
  // Check if we're in demo mode
  const inDemoMode = await isDemoMode();
  
  if (inDemoMode) {
    // In demo mode, booking completion should be disabled
    return {
      success: false,
      error: 'Booking completion is disabled in demo mode. Please log in with a real account to complete bookings.',
      isDemoMode: true
    };
  }

  // Check authentication for real Supabase operations
  const authResult = await getSupabaseJWT();
  if (!authResult.success) {
    return {
      success: false,
      error: 'Authentication required. Please log in again.',
      requiresAuth: true
    };
  }

  // Validate required fields only for complete bookings, not status-only updates
  if (!bookingData.pickup?.trim() && bookingData.pickup !== undefined) {
    return { success: false, error: 'Pickup location is required' };
  }
  
  if ((!bookingData.destination && !bookingData.dropoff) && (bookingData.destination !== undefined || bookingData.dropoff !== undefined)) {
    return { success: false, error: 'Destination/dropoff location is required' };
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        pickup: bookingData.pickup.trim(),
        dropoff: (bookingData.destination || bookingData.dropoff)?.trim(),
        scheduled_at: bookingData.scheduledAt || `${bookingData.date}T${bookingData.time}:00`,
        status: bookingData.status,
        customer_id: bookingData.customerId || null,
        driver_id: bookingData.driverId || null,
        vehicle_id: bookingData.vehicleId || null,
        type: bookingData.type,
        source: bookingData.source,
        price: bookingData.price ? parseFloat(bookingData.price) : null,
        pickup_completed: bookingData.pickupCompleted,
        return_completed: bookingData.returnCompleted,
        notes: bookingData.notes?.trim() || null
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      
      // Provide specific error messages
      let errorMessage = "Failed to update booking";
      if (error.code === '23503') { // Foreign key constraint violation
        if (error.message.includes('customer_id')) {
          errorMessage = "Invalid customer selected";
        } else if (error.message.includes('driver_id')) {
          errorMessage = "Invalid driver selected";
        } else if (error.message.includes('vehicle_id')) {
          errorMessage = "Invalid vehicle selected";
        }
      } else if (error.code === '42501') { // Insufficient privileges
        errorMessage = "You don't have permission to update this booking";
      } else if (error.message.includes('not found')) {
        errorMessage = "Booking not found";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true, booking: data };
  } catch (error) {
    console.error("Network error updating booking:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}

export async function deleteBooking(id) {
  try {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting booking:", error);
      
      // Provide specific error messages
      let errorMessage = "Failed to delete booking";
      if (error.code === '23503') { // Foreign key constraint violation
        errorMessage = "Cannot delete booking. It may be referenced by invoices or other records.";
      } else if (error.code === '42501') { // Insufficient privileges
        errorMessage = "You don't have permission to delete this booking";
      } else if (error.message.includes('not found')) {
        errorMessage = "Booking not found. It may have already been deleted.";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error("Network error deleting booking:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}

// Initialize demo bookings data
function initializeDemoBookings() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  return [
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
      price: 45,
      source: "internal",
      pickupCompleted: false,
      returnCompleted: false,
      hasReturn: false,
      notes: "Demo booking - airport pickup"
    },
    {
      id: 2,
      customer: "Jane Smith",
      pickup: "789 Pine St",
      destination: "321 Elm Ave",
      date: nextWeek.toISOString().split('T')[0],
      time: "14:30",
      status: "pending",
      driver: "Sarah Wilson",
      vehicle: "Honda Accord",
      type: "single",
      price: 35,
      source: "online",
      pickupCompleted: false,
      returnCompleted: false,
      hasReturn: false,
      notes: "Demo booking - city transfer"
    },
    {
      id: 3,
      customer: "Bob Johnson",
      pickup: "Airport Terminal 1",
      destination: "Downtown Hotel",
      date: today.toISOString().split('T')[0],
      time: "16:00",
      status: "confirmed",
      driver: "Tom Davis",
      vehicle: "Mercedes E-Class",
      type: "single",
      price: 60,
      source: "internal",
      pickupCompleted: true,
      returnCompleted: false,
      hasReturn: false,
      notes: "Demo booking - completed pickup, ready for completion"
    }
  ];
}