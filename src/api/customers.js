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
  const { data, error } = await supabase
    .from("customers")
    .insert([{
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      preferred_payment_method: customerData.preferredPayment,
      status: customerData.status || "active"
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, customer: data };
}

export async function updateCustomer(id, customerData) {
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      preferred_payment_method: customerData.preferredPayment,
      status: customerData.status
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, customer: data };
}

export async function deleteCustomer(id) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting customer:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}