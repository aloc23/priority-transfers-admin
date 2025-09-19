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
  // Validate required fields before making the API call
  if (!vehicleData.make?.trim()) {
    return { success: false, error: 'Vehicle make is required' };
  }
  
  if (!vehicleData.model?.trim()) {
    return { success: false, error: 'Vehicle model is required' };
  }
  
  if (!vehicleData.license?.trim()) {
    return { success: false, error: 'License plate number is required' };
  }

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .insert([{
        make: vehicleData.make.trim(),
        model: vehicleData.model.trim(),
        year: vehicleData.year ? parseInt(vehicleData.year) : null,
        plate_number: vehicleData.license.trim(),
        status: vehicleData.status || "active",
        driver_id: vehicleData.driverId || null
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating vehicle:", error);
      
      // Provide specific error messages based on error code
      let errorMessage = "Failed to create vehicle";
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('plate_number')) {
          errorMessage = "A vehicle with this license plate number already exists";
        } else {
          errorMessage = "This vehicle information already exists";
        }
      } else if (error.code === '23502') { // Not null constraint violation
        errorMessage = "Missing required vehicle information";
      } else if (error.message.includes('invalid input')) {
        errorMessage = "Invalid input data provided";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true, vehicle: data };
  } catch (error) {
    console.error("Network error creating vehicle:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}

export async function updateVehicle(id, vehicleData) {
  // Validate required fields
  if (!vehicleData.make?.trim()) {
    return { success: false, error: 'Vehicle make is required' };
  }
  
  if (!vehicleData.model?.trim()) {
    return { success: false, error: 'Vehicle model is required' };
  }
  
  if (!vehicleData.license?.trim()) {
    return { success: false, error: 'License plate number is required' };
  }

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .update({
        make: vehicleData.make.trim(),
        model: vehicleData.model.trim(),
        year: vehicleData.year ? parseInt(vehicleData.year) : null,
        plate_number: vehicleData.license.trim(),
        status: vehicleData.status,
        driver_id: vehicleData.driverId || null
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating vehicle:", error);
      
      // Provide specific error messages
      let errorMessage = "Failed to update vehicle";
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('plate_number')) {
          errorMessage = "A vehicle with this license plate number already exists";
        }
      } else if (error.code === '42501') { // Insufficient privileges
        errorMessage = "You don't have permission to update this vehicle";
      } else if (error.message.includes('not found')) {
        errorMessage = "Vehicle not found";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true, vehicle: data };
  } catch (error) {
    console.error("Network error updating vehicle:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}

export async function deleteVehicle(id) {
  try {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting vehicle:", error);
      
      // Provide specific error messages
      let errorMessage = "Failed to delete vehicle";
      if (error.code === '23503') { // Foreign key constraint violation
        errorMessage = "Cannot delete vehicle. It may be assigned to active bookings or drivers.";
      } else if (error.code === '42501') { // Insufficient privileges
        errorMessage = "You don't have permission to delete this vehicle";
      } else if (error.message.includes('not found')) {
        errorMessage = "Vehicle not found. It may have already been deleted.";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error("Network error deleting vehicle:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}