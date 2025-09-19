import supabase from "../utils/supabaseClient";

export async function fetchInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      customer_id,
      booking_id,
      amount,
      currency,
      status,
      due_date,
      issued_date,
      paid_date,
      notes,
      customers (
        id,
        name,
        email
      ),
      bookings (
        id,
        pickup,
        dropoff
      )
    `)
    .order("issued_date", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error.message);
    return [];
  }

  // Match the shape your UI was using from localStorage
  return data.map((i) => ({
    id: i.id,
    invoiceNumber: i.invoice_number,
    customerId: i.customer_id,
    customer: i.customers ? i.customers.name : null,
    customerEmail: i.customers ? i.customers.email : null,
    bookingId: i.booking_id,
    booking: i.bookings ? `${i.bookings.pickup} to ${i.bookings.dropoff}` : null,
    amount: i.amount,
    currency: i.currency || 'EUR',
    status: i.status,
    dueDate: i.due_date,
    issuedDate: i.issued_date,
    paidDate: i.paid_date,
    notes: i.notes
  }));
}

export async function createInvoice(invoiceData) {
  const { data, error } = await supabase
    .from("invoices")
    .insert([{
      invoice_number: invoiceData.invoiceNumber,
      customer_id: invoiceData.customerId,
      booking_id: invoiceData.bookingId,
      amount: invoiceData.amount,
      currency: invoiceData.currency || 'EUR',
      status: invoiceData.status || "pending",
      due_date: invoiceData.dueDate,
      issued_date: invoiceData.issuedDate || new Date().toISOString(),
      notes: invoiceData.notes
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, invoice: data };
}

export async function updateInvoice(id, invoiceData) {
  const { data, error } = await supabase
    .from("invoices")
    .update({
      invoice_number: invoiceData.invoiceNumber,
      customer_id: invoiceData.customerId,
      booking_id: invoiceData.bookingId,
      amount: invoiceData.amount,
      currency: invoiceData.currency,
      status: invoiceData.status,
      due_date: invoiceData.dueDate,
      paid_date: invoiceData.paidDate,
      notes: invoiceData.notes
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, invoice: data };
}

export async function deleteInvoice(id) {
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting invoice:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}