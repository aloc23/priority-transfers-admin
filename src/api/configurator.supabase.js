import supabase from "../utils/supabaseClient";

export async function fetchConfigurator(vehicleId) {
  const { data, error } = await supabase
    .from("vehicle_configurator")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .single();
  if (error) throw error;
  return data;
}

export async function createConfigurator(vehicleId, config = {}) {
  const { data, error } = await supabase
    .from("vehicle_configurator")
    .insert([{ vehicle_id: vehicleId, ...config }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConfigurator(vehicleId, updates) {
  const { data, error } = await supabase
    .from("vehicle_configurator")
    .update(updates)
    .eq("vehicle_id", vehicleId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
