import supabase from "../utils/supabaseClient";

export async function fetchVehicles() {
  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      id, make, model, plate_number, year, status, driver_id,
      -- If you store running costs on vehicles table too, include them here
      total_running_cost
    `)
    .order("make", { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateVehicle(id, updates) {
  const { data, error } = await supabase
    .from("vehicles")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data?.[0];
}

export async function createVehicle(vehicle) {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicle)
    .select();
  if (error) throw error;
  return data?.[0];
}

export async function deleteVehicle(id) {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
  return true;
}
