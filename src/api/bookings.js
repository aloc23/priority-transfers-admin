import supabase from "../utils/supabaseClient";

export async function fetchBookings() {
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
  const { data, error } = await supabase
    .from("bookings")
    .insert([{
      pickup: bookingData.pickup,
      dropoff: bookingData.destination || bookingData.dropoff,
      scheduled_at: bookingData.scheduledAt || `${bookingData.date}T${bookingData.time}:00`,
      status: bookingData.status || "pending",
      customer_id: bookingData.customerId,
      driver_id: bookingData.driverId,
      vehicle_id: bookingData.vehicleId,
      type: bookingData.type || "single",
      source: bookingData.source || "internal",
      price: bookingData.price,
      pickup_completed: bookingData.pickupCompleted || false,
      return_completed: bookingData.returnCompleted || false,
      notes: bookingData.notes
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, booking: data };
}

export async function updateBooking(id, bookingData) {
  const { data, error } = await supabase
    .from("bookings")
    .update({
      pickup: bookingData.pickup,
      dropoff: bookingData.destination || bookingData.dropoff,
      scheduled_at: bookingData.scheduledAt || `${bookingData.date}T${bookingData.time}:00`,
      status: bookingData.status,
      customer_id: bookingData.customerId,
      driver_id: bookingData.driverId,
      vehicle_id: bookingData.vehicleId,
      type: bookingData.type,
      source: bookingData.source,
      price: bookingData.price,
      pickup_completed: bookingData.pickupCompleted,
      return_completed: bookingData.returnCompleted,
      notes: bookingData.notes
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating booking:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, booking: data };
}

export async function deleteBooking(id) {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting booking:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}