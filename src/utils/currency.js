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

export const calculateRevenue = (bookings, status = 'completed') => {
  const filteredBookings = bookings.filter(booking => booking.status === status);
  return filteredBookings.length * EURO_PRICE_PER_BOOKING;
};