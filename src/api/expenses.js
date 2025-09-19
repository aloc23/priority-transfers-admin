import supabase from "../utils/supabaseClient";

export async function fetchExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      id,
      date,
      description,
      category,
      amount,
      type,
      vehicle_id,
      driver_id,
      partner_id,
      booking_id,
      receipt_url,
      status,
      vendor,
      service_description,
      vehicles (
        id,
        make,
        model,
        plate_number
      ),
      drivers (
        id,
        name
      ),
      partners (
        id,
        name
      )
    `)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((e) => ({
    id: e.id,
    date: e.date,
    description: e.description,
    category: e.category,
    amount: e.amount,
    type: e.type,
    vehicleId: e.vehicle_id,
    vehicle: e.vehicles ? e.vehicles.plate_number : null,
    driverId: e.driver_id,
    driver: e.drivers ? e.drivers.name : null,
    partnerId: e.partner_id,
    partner: e.partners ? e.partners.name : null,
    bookingId: e.booking_id,
    receipt: e.receipt_url,
    status: e.status,
    vendor: e.vendor,
    service: e.service_description
  }));
}

export async function createExpense(expenseData) {
  const { data, error } = await supabase
    .from("expenses")
    .insert([{
      date: expenseData.date,
      description: expenseData.description,
      category: expenseData.category,
      amount: expenseData.amount,
      type: expenseData.type,
      vehicle_id: expenseData.vehicleId,
      driver_id: expenseData.driverId,
      partner_id: expenseData.partnerId,
      booking_id: expenseData.bookingId,
      receipt_url: expenseData.receipt,
      status: expenseData.status || "pending",
      vendor: expenseData.vendor,
      service_description: expenseData.service
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating expense:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, expense: data };
}

export async function updateExpense(id, expenseData) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      date: expenseData.date,
      description: expenseData.description,
      category: expenseData.category,
      amount: expenseData.amount,
      type: expenseData.type,
      vehicle_id: expenseData.vehicleId,
      driver_id: expenseData.driverId,
      partner_id: expenseData.partnerId,
      booking_id: expenseData.bookingId,
      receipt_url: expenseData.receipt,
      status: expenseData.status,
      vendor: expenseData.vendor,
      service_description: expenseData.service
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating expense:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, expense: data };
}

export async function deleteExpense(id) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting expense:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}