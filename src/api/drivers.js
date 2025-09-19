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
  // Validate required fields before making the API call
  if (!driverData.name?.trim()) {
    return { success: false, error: 'Driver name is required' };
  }
  
  if (!driverData.license?.trim()) {
    return { success: false, error: 'License number is required' };
  }
  
  if (!driverData.phone?.trim()) {
    return { success: false, error: 'Phone number is required' };
  }

  try {
    const { data, error } = await supabase
      .from("drivers")
      .insert([{
        name: driverData.name.trim(),
        email: driverData.email?.trim() || null,
        phone: driverData.phone.trim(),
        license_number: driverData.license.trim(),
        status: driverData.status || "active",
        experience: driverData.experience || null,
        rating: driverData.rating || 5.0,
        vehicle_id: driverData.vehicleId || null
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating driver:", error);
      
      // Provide specific error messages based on error code
      let errorMessage = "Failed to create driver";
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('license_number')) {
          errorMessage = "A driver with this license number already exists";
        } else if (error.message.includes('email')) {
          errorMessage = "A driver with this email already exists";
        } else {
          errorMessage = "This driver information already exists";
        }
      } else if (error.code === '23502') { // Not null constraint violation
        errorMessage = "Missing required information";
      } else if (error.message.includes('invalid input')) {
        errorMessage = "Invalid input data provided";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true, driver: data };
  } catch (error) {
    console.error("Network error creating driver:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}

export async function updateDriver(id, driverData) {
  // Validate required fields
  if (!driverData.name?.trim()) {
    return { success: false, error: 'Driver name is required' };
  }
  
  if (!driverData.license?.trim()) {
    return { success: false, error: 'License number is required' };
  }
  
  if (!driverData.phone?.trim()) {
    return { success: false, error: 'Phone number is required' };
  }

  try {
    const { data, error } = await supabase
      .from("drivers")
      .update({
        name: driverData.name.trim(),
        email: driverData.email?.trim() || null,
        phone: driverData.phone.trim(),
        license_number: driverData.license.trim(),
        status: driverData.status,
        experience: driverData.experience,
        rating: driverData.rating,
        vehicle_id: driverData.vehicleId || null
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating driver:", error);
      
      // Provide specific error messages
      let errorMessage = "Failed to update driver";
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('license_number')) {
          errorMessage = "A driver with this license number already exists";
        } else if (error.message.includes('email')) {
          errorMessage = "A driver with this email already exists";
        }
      } else if (error.code === '42501') { // Insufficient privileges
        errorMessage = "You don't have permission to update this driver";
      } else if (error.message.includes('not found')) {
        errorMessage = "Driver not found";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true, driver: data };
  } catch (error) {
    console.error("Network error updating driver:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
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