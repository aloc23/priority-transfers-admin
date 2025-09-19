import supabase from "../utils/supabaseClient";

export async function fetchVehicles() {
  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      id,
      make,
      model,
      year,
      plate_number,
      status,
      driver_id,
      drivers (
        id,
        name,
        email
      )
    `)
    .order("make", { ascending: true });

  if (error) {
    console.error("Error fetching vehicles:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((v) => ({
    id: v.id,
    make: v.make,
    model: v.model,
    year: v.year,
    license: v.plate_number,
    status: v.status,
    driverId: v.driver_id,
    driver: v.drivers ? v.drivers.name : null
  }));
}

export async function createVehicle(vehicleData) {
  const { data, error } = await supabase
    .from("vehicles")
    .insert([{
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      plate_number: vehicleData.license,
      status: vehicleData.status || "active",
      driver_id: vehicleData.driverId
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating vehicle:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, vehicle: data };
}

export async function updateVehicle(id, vehicleData) {
  const { data, error } = await supabase
    .from("vehicles")
    .update({
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      plate_number: vehicleData.license,
      status: vehicleData.status,
      driver_id: vehicleData.driverId
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating vehicle:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, vehicle: data };
}

export async function deleteVehicle(id) {
  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting vehicle:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}