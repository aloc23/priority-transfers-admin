import supabase from "../utils/supabaseClient";

export async function fetchEstimations() {
  const { data, error } = await supabase
    .from("estimations")
    .select(`
      id,
      customer_name,
      customer_email,
      customer_phone,
      pickup_location,
      dropoff_location,
      pickup_date,
      pickup_time,
      return_date,
      return_time,
      passengers,
      vehicle_type,
      distance_km,
      duration_minutes,
      estimated_price,
      status,
      notes,
      created_at,
      expires_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching estimations:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((e) => ({
    id: e.id,
    customerName: e.customer_name,
    customerEmail: e.customer_email,
    customerPhone: e.customer_phone,
    pickup: e.pickup_location,
    dropoff: e.dropoff_location,
    pickupDate: e.pickup_date,
    pickupTime: e.pickup_time,
    returnDate: e.return_date,
    returnTime: e.return_time,
    passengers: e.passengers,
    vehicleType: e.vehicle_type,
    distance: e.distance_km,
    duration: e.duration_minutes,
    estimatedPrice: e.estimated_price,
    status: e.status,
    notes: e.notes,
    createdAt: e.created_at,
    expiresAt: e.expires_at
  }));
}

export async function createEstimation(estimationData) {
  const { data, error } = await supabase
    .from("estimations")
    .insert([{
      customer_name: estimationData.customerName,
      customer_email: estimationData.customerEmail,
      customer_phone: estimationData.customerPhone,
      pickup_location: estimationData.pickup,
      dropoff_location: estimationData.dropoff,
      pickup_date: estimationData.pickupDate,
      pickup_time: estimationData.pickupTime,
      return_date: estimationData.returnDate,
      return_time: estimationData.returnTime,
      passengers: estimationData.passengers,
      vehicle_type: estimationData.vehicleType,
      distance_km: estimationData.distance,
      duration_minutes: estimationData.duration,
      estimated_price: estimationData.estimatedPrice,
      status: estimationData.status || "pending",
      notes: estimationData.notes,
      expires_at: estimationData.expiresAt
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating estimation:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, estimation: data };
}

export async function updateEstimation(id, estimationData) {
  const { data, error } = await supabase
    .from("estimations")
    .update({
      customer_name: estimationData.customerName,
      customer_email: estimationData.customerEmail,
      customer_phone: estimationData.customerPhone,
      pickup_location: estimationData.pickup,
      dropoff_location: estimationData.dropoff,
      pickup_date: estimationData.pickupDate,
      pickup_time: estimationData.pickupTime,
      return_date: estimationData.returnDate,
      return_time: estimationData.returnTime,
      passengers: estimationData.passengers,
      vehicle_type: estimationData.vehicleType,
      distance_km: estimationData.distance,
      duration_minutes: estimationData.duration,
      estimated_price: estimationData.estimatedPrice,
      status: estimationData.status,
      notes: estimationData.notes,
      expires_at: estimationData.expiresAt
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating estimation:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, estimation: data };
}

export async function deleteEstimation(id) {
  const { error } = await supabase
    .from("estimations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting estimation:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}