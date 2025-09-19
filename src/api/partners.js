import supabase from "../utils/supabaseClient";

export async function fetchPartners() {
  const { data, error } = await supabase
    .from("partners")
    .select(`
      id,
      name,
      contact_person,
      phone,
      email,
      status,
      rating,
      address,
      completed_bookings,
      total_revenue,
      commission_rate,
      payment_terms,
      contract_start,
      contract_end
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching partners:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    contact: p.contact_person,
    phone: p.phone,
    email: p.email,
    status: p.status,
    rating: p.rating,
    address: p.address,
    completedBookings: p.completed_bookings || 0,
    totalRevenue: p.total_revenue || 0,
    commissionRate: p.commission_rate,
    paymentTerms: p.payment_terms,
    contractStart: p.contract_start,
    contractEnd: p.contract_end
  }));
}

export async function createPartner(partnerData) {
  const { data, error } = await supabase
    .from("partners")
    .insert([{
      name: partnerData.name,
      contact_person: partnerData.contact,
      phone: partnerData.phone,
      email: partnerData.email,
      status: partnerData.status || "active",
      rating: partnerData.rating || 5.0,
      address: partnerData.address,
      commission_rate: partnerData.commissionRate,
      payment_terms: partnerData.paymentTerms,
      contract_start: partnerData.contractStart,
      contract_end: partnerData.contractEnd
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating partner:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, partner: data };
}

export async function updatePartner(id, partnerData) {
  const { data, error } = await supabase
    .from("partners")
    .update({
      name: partnerData.name,
      contact_person: partnerData.contact,
      phone: partnerData.phone,
      email: partnerData.email,
      status: partnerData.status,
      rating: partnerData.rating,
      address: partnerData.address,
      commission_rate: partnerData.commissionRate,
      payment_terms: partnerData.paymentTerms,
      contract_start: partnerData.contractStart,
      contract_end: partnerData.contractEnd
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating partner:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, partner: data };
}

export async function deletePartner(id) {
  const { error } = await supabase
    .from("partners")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting partner:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}