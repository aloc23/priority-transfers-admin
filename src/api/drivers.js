import supabase from "../utils/supabaseClient";

export async function fetchDrivers() {
  const { data, error } = await supabase
    .from("drivers")
    .select(`
      id,
      name,
      email,
      phone,
      license_number,
      status,
      experience,
      rating,
      vehicle_id,
      vehicles (
        id,
        make,
        model,
        plate_number
      )
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching drivers:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    license: d.license_number,
    status: d.status,
    experience: d.experience,
    rating: d.rating,
    vehicleId: d.vehicle_id,
    vehicle: d.vehicles ? `${d.vehicles.make} ${d.vehicles.model}` : null
  }));
}

export async function createDriver(driverData) {
  const { data, error } = await supabase
    .from("drivers")
    .insert([{
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone,
      license_number: driverData.license,
      status: driverData.status || "active",
      experience: driverData.experience,
      rating: driverData.rating || 5.0,
      vehicle_id: driverData.vehicleId
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating driver:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, driver: data };
}

export async function updateDriver(id, driverData) {
  const { data, error } = await supabase
    .from("drivers")
    .update({
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone,
      license_number: driverData.license,
      status: driverData.status,
      experience: driverData.experience,
      rating: driverData.rating,
      vehicle_id: driverData.vehicleId
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating driver:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, driver: data };
}

export async function deleteDriver(id) {
  const { error } = await supabase
    .from("drivers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting driver:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}