import supabase from "../utils/supabaseClient";

// Fetch all vehicles with cost breakdown
export async function fetchVehicles() {
  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      id,
      make,
      model,
      plate_number,
      year,
      status,
      driver_id,
      fuel_type,
      fuel_cost,
      insurance_cost,
      maintenance_cost,
      depreciation_cost,
      service_cost,
      tax_cost,
      lease_cost,
      other_costs,
      total_running_cost
    `)
    .order("make", { ascending: true });

  if (error) throw error;
  return data;
}

// Update a vehicle
export async function updateVehicle(id, updates) {
  const { data, error } = await supabase
    .from("vehicles")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

// Create a new vehicle
export async function createVehicle(vehicle) {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicle)
    .select();

  if (error) throw error;
  return data[0];
}

// Delete vehicle
export async function deleteVehicle(id) {
  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
