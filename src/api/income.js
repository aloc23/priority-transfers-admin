import supabase from "../utils/supabaseClient";

export async function fetchIncome() {
  const { data, error } = await supabase
    .from("income")
    .select(`
      id,
      date,
      description,
      category,
      amount,
      type,
      customer_id,
      booking_id,
      driver_id,
      vehicle_id,
      partner_id,
      status,
      payment_method,
      customers (
        id,
        name
      ),
      drivers (
        id,
        name
      ),
      vehicles (
        id,
        make,
        model,
        plate_number
      ),
      partners (
        id,
        name
      )
    `)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching income:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((i) => ({
    id: i.id,
    date: i.date,
    description: i.description,
    category: i.category,
    amount: i.amount,
    type: i.type,
    customerId: i.customer_id,
    customer: i.customers ? i.customers.name : null,
    bookingId: i.booking_id,
    driverId: i.driver_id,
    driver: i.drivers ? i.drivers.name : null,
    vehicleId: i.vehicle_id,
    vehicle: i.vehicles ? i.vehicles.plate_number : null,
    partnerId: i.partner_id,
    partner: i.partners ? i.partners.name : null,
    status: i.status,
    paymentMethod: i.payment_method
  }));
}

export async function createIncome(incomeData) {
  const { data, error } = await supabase
    .from("income")
    .insert([{
      date: incomeData.date,
      description: incomeData.description,
      category: incomeData.category,
      amount: incomeData.amount,
      type: incomeData.type,
      customer_id: incomeData.customerId,
      booking_id: incomeData.bookingId,
      driver_id: incomeData.driverId,
      vehicle_id: incomeData.vehicleId,
      partner_id: incomeData.partnerId,
      status: incomeData.status || "received",
      payment_method: incomeData.paymentMethod
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating income:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, income: data };
}

export async function updateIncome(id, incomeData) {
  const { data, error } = await supabase
    .from("income")
    .update({
      date: incomeData.date,
      description: incomeData.description,
      category: incomeData.category,
      amount: incomeData.amount,
      type: incomeData.type,
      customer_id: incomeData.customerId,
      booking_id: incomeData.bookingId,
      driver_id: incomeData.driverId,
      vehicle_id: incomeData.vehicleId,
      partner_id: incomeData.partnerId,
      status: incomeData.status,
      payment_method: incomeData.paymentMethod
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating income:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, income: data };
}

export async function deleteIncome(id) {
  const { error } = await supabase
    .from("income")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting income:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}