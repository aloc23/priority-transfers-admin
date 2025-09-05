// Currency utility functions for consistent formatting across the app
export const formatCurrency = (amount, currency = 'EUR') => {
  const currencySymbols = {
    EUR: '€',
    USD: '$',
    GBP: '£'
  };
  
  const symbol = currencySymbols[currency] || '€';
  return `${symbol}${amount}`;
};

export const EURO_PRICE_PER_BOOKING = 45;

export const calculateRevenue = (bookings, status = 'completed', invoices = []) => {
  const filteredBookings = bookings.filter(booking => booking.status === status);
  const bookingRevenue = filteredBookings.reduce((sum, booking) => 
    sum + (booking.price || booking.amount || EURO_PRICE_PER_BOOKING), 0);
  
  // Add revenue from paid independent invoices (not linked to bookings)
  const independentInvoiceRevenue = invoices
    .filter(invoice => invoice.status === 'paid' && !invoice.bookingId)
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  return bookingRevenue + independentInvoiceRevenue;
};