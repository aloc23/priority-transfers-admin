import supabase from "../utils/supabaseClient";

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select(`
      id,
      name,
      email,
      phone,
      address,
      created_at,
      total_bookings,
      total_spent,
      preferred_payment_method,
      status
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    joinDate: c.created_at,
    totalBookings: c.total_bookings || 0,
    totalSpent: c.total_spent || 0,
    preferredPayment: c.preferred_payment_method,
    status: c.status || "active"
  }));
}

export async function createCustomer(customerData) {
  // Validate required fields before making the API call
  if (!customerData.name?.trim()) {
    return { success: false, error: 'Customer name is required' };
  }
  
  if (!customerData.email?.trim()) {
    return { success: false, error: 'Email address is required' };
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([{
        name: customerData.name.trim(),
        email: customerData.email.trim(),
        phone: customerData.phone?.trim() || null,
        address: customerData.address?.trim() || null,
        preferred_payment_method: customerData.preferredPayment || null,
        status: customerData.status || "active"
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      
      // Provide specific error messages based on error code
      let errorMessage = "Failed to create customer";
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('email')) {
          errorMessage = "A customer with this email address already exists";
        } else {
          errorMessage = "This customer information already exists";
        }
      } else if (error.code === '23502') { // Not null constraint violation
        errorMessage = "Missing required customer information";
      } else if (error.message.includes('invalid input')) {
        errorMessage = "Invalid input data provided";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true, customer: data };
  } catch (error) {
    console.error("Network error creating customer:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}

export async function updateCustomer(id, customerData) {
  // Validate required fields
  if (!customerData.name?.trim()) {
    return { success: false, error: 'Customer name is required' };
  }
  
  if (!customerData.email?.trim()) {
    return { success: false, error: 'Email address is required' };
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: customerData.name.trim(),
        email: customerData.email.trim(),
        phone: customerData.phone?.trim() || null,
        address: customerData.address?.trim() || null,
        preferred_payment_method: customerData.preferredPayment || null,
        status: customerData.status
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      
      // Provide specific error messages
      let errorMessage = "Failed to update customer";
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('email')) {
          errorMessage = "A customer with this email address already exists";
        }
      } else if (error.code === '42501') { // Insufficient privileges
        errorMessage = "You don't have permission to update this customer";
      } else if (error.message.includes('not found')) {
        errorMessage = "Customer not found";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true, customer: data };
  } catch (error) {
    console.error("Network error updating customer:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}

export async function deleteCustomer(id) {
  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting customer:", error);
      
      // Provide specific error messages
      let errorMessage = "Failed to delete customer";
      if (error.code === '23503') { // Foreign key constraint violation
        errorMessage = "Cannot delete customer. They may have active bookings or invoices.";
      } else if (error.code === '42501') { // Insufficient privileges
        errorMessage = "You don't have permission to delete this customer";
      } else if (error.message.includes('not found')) {
        errorMessage = "Customer not found. They may have already been deleted.";
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error("Network error deleting customer:", error);
    return { 
      success: false, 
      error: "Unable to connect to the server. Please check your connection and try again." 
    };
  }
}