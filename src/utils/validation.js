// Validation utility functions
export const validateBookingForm = (formData) => {
  const errors = {};

  if (!formData.customer?.trim()) {
    errors.customer = 'Customer name is required';
  }

  if (!formData.pickup?.trim()) {
    errors.pickup = 'Pickup location is required';
  }

  if (!formData.destination?.trim()) {
    errors.destination = 'Destination is required';
  }

  if (!formData.date) {
    errors.date = 'Date is required';
  } else {
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.date = 'Date cannot be in the past';
    }
  }

  if (!formData.time) {
    errors.time = 'Time is required';
  }

  if (!formData.driver) {
    errors.driver = 'Driver selection is required';
  }

  if (!formData.vehicle) {
    errors.vehicle = 'Vehicle selection is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};