/**
 * Priority Transfers Price Calculator Utility
 * 
 * This module provides a comprehensive, modular price calculation system
 * for the Priority Transfers admin panel. It handles all pricing components
 * including base rates, distance, time, vehicle adjustments, peak surcharges,
 * additional fees, and driver costs.
 */

// Configuration objects for easy maintenance and extensibility
const SERVICE_RATES = {
  priority: { perKm: 2.5, perMin: 1.2, baseRate: 15 },
  standard: { perKm: 2.0, perMin: 1.0, baseRate: 10 },
  luxury: { perKm: 3.5, perMin: 1.8, baseRate: 25 }
};

const VEHICLE_MULTIPLIERS = {
  standard: 1.0,
  premium: 1.2,
  luxury: 1.5,
  van: 1.3
};

const DRIVER_RATES = {
  standard: 0.15, // 15% of base calculation
  premium: 0.18,  // 18% for premium service
  luxury: 0.20    // 20% for luxury service
};

// Peak hours configuration - easily extensible
const PEAK_HOURS = [
  { start: 7, end: 9 },   // Morning rush: 7-9 AM
  { start: 17, end: 19 }  // Evening rush: 5-7 PM
];

const PEAK_SURCHARGE_RATE = 0.25; // 25% surcharge during peak hours

/**
 * Validates and sanitizes input parameters
 * @param {Object} params - Input parameters
 * @returns {Object} - Validated parameters with defaults
 */
export const validateInputs = (params) => {
  const {
    distance = 0,
    duration = 0,
    serviceType = 'standard',
    vehicleType = 'standard',
    additionalFees = 0,
    manualBasePrice = null,
    customDateTime = null
  } = params;

  return {
    distance: Math.max(0, Number(distance) || 0),
    duration: Math.max(0, Number(duration) || 0),
    serviceType: SERVICE_RATES[serviceType] ? serviceType : 'standard',
    vehicleType: VEHICLE_MULTIPLIERS[vehicleType] ? vehicleType : 'standard',
    additionalFees: Math.max(0, Number(additionalFees) || 0),
    manualBasePrice: manualBasePrice ? Math.max(0, Number(manualBasePrice)) : null,
    customDateTime: customDateTime || new Date()
  };
};

/**
 * Determines if a given time falls within peak hours
 * @param {Date} dateTime - Date/time to check
 * @returns {boolean} - True if within peak hours
 */
export const isPeakHour = (dateTime = new Date()) => {
  const hour = dateTime.getHours();
  return PEAK_HOURS.some(period => hour >= period.start && hour <= period.end);
};

/**
 * Calculates base rate component
 * @param {string} serviceType - Service type (standard, priority, luxury)
 * @returns {number} - Base rate amount
 */
export const calculateBaseRate = (serviceType) => {
  const serviceRate = SERVICE_RATES[serviceType] || SERVICE_RATES.standard;
  return serviceRate.baseRate;
};

/**
 * Calculates distance-based pricing component
 * @param {number} distance - Distance in kilometers
 * @param {string} serviceType - Service type
 * @returns {number} - Distance cost
 */
export const calculateDistancePrice = (distance, serviceType) => {
  const serviceRate = SERVICE_RATES[serviceType] || SERVICE_RATES.standard;
  return distance * serviceRate.perKm;
};

/**
 * Calculates time-based pricing component
 * @param {number} duration - Duration in minutes
 * @param {string} serviceType - Service type
 * @returns {number} - Time cost
 */
export const calculateTimePrice = (duration, serviceType) => {
  const serviceRate = SERVICE_RATES[serviceType] || SERVICE_RATES.standard;
  return duration * serviceRate.perMin;
};

/**
 * Calculates vehicle adjustment component
 * @param {number} baseAmount - Base amount to apply multiplier to
 * @param {string} vehicleType - Vehicle type
 * @returns {number} - Vehicle adjustment amount (positive for surcharge, 0 for standard)
 */
export const calculateVehicleAdjustment = (baseAmount, vehicleType) => {
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.0;
  return baseAmount * (multiplier - 1);
};

/**
 * Calculates peak hour surcharge component
 * @param {number} baseAmount - Base amount to apply surcharge to
 * @param {string} vehicleType - Vehicle type (affects multiplier)
 * @param {Date} dateTime - Date/time for peak hour calculation
 * @returns {number} - Peak surcharge amount
 */
export const calculatePeakSurcharge = (baseAmount, vehicleType, dateTime = new Date()) => {
  if (!isPeakHour(dateTime)) {
    return 0;
  }
  
  const vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.0;
  return baseAmount * vehicleMultiplier * PEAK_SURCHARGE_RATE;
};

/**
 * Calculates driver cost component
 * @param {number} baseAmount - Base calculation amount
 * @param {string} serviceType - Service type (affects driver rate)
 * @returns {number} - Driver cost
 */
export const calculateDriverCost = (baseAmount, serviceType) => {
  const driverRate = DRIVER_RATES[serviceType] || DRIVER_RATES.standard;
  return baseAmount * driverRate;
};

/**
 * Main price calculation function that computes all components
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Complete price breakdown
 */
export const calculatePriceBreakdown = (params) => {
  const validatedParams = validateInputs(params);
  const {
    distance,
    duration,
    serviceType,
    vehicleType,
    additionalFees,
    manualBasePrice,
    customDateTime
  } = validatedParams;

  // Calculate base components
  const baseRate = calculateBaseRate(serviceType);
  const distancePrice = calculateDistancePrice(distance, serviceType);
  const timePrice = calculateTimePrice(duration, serviceType);
  
  // Calculate subtotal before vehicle and peak adjustments
  const subtotal = baseRate + distancePrice + timePrice;
  
  // Calculate adjustments
  const vehicleAdjustment = calculateVehicleAdjustment(subtotal, vehicleType);
  const peakSurcharge = calculatePeakSurcharge(subtotal, vehicleType, customDateTime);
  
  // Calculate driver cost based on subtotal + adjustments
  const adjustedSubtotal = subtotal + vehicleAdjustment;
  const driverCost = calculateDriverCost(adjustedSubtotal, serviceType);
  
  // Calculate final amounts
  const calculatedBase = subtotal + vehicleAdjustment + peakSurcharge + driverCost;
  const finalBasePrice = manualBasePrice ? Math.max(manualBasePrice, calculatedBase) : calculatedBase;
  const total = finalBasePrice + additionalFees;

  return {
    // Individual components
    baseRate,
    distancePrice,
    timePrice,
    vehicleAdjustment,
    peakSurcharge,
    driverCost,
    additionalFees,
    
    // Calculated totals
    subtotal,
    calculatedBase,
    finalBasePrice,
    total,
    
    // Meta information
    isPeakHour: isPeakHour(customDateTime),
    serviceType,
    vehicleType,
    
    // Configuration info for display
    serviceRate: SERVICE_RATES[serviceType],
    vehicleMultiplier: VEHICLE_MULTIPLIERS[vehicleType],
    driverRate: DRIVER_RATES[serviceType]
  };
};

/**
 * Simple total price calculator for quick calculations
 * @param {Object} params - Calculation parameters
 * @returns {number} - Total price
 */
export const calculateTotalPrice = (params) => {
  const breakdown = calculatePriceBreakdown(params);
  return breakdown.total;
};

/**
 * Get pricing configuration for UI display
 * @returns {Object} - Configuration objects
 */
export const getPricingConfiguration = () => {
  return {
    serviceRates: SERVICE_RATES,
    vehicleMultipliers: VEHICLE_MULTIPLIERS,
    driverRates: DRIVER_RATES,
    peakHours: PEAK_HOURS,
    peakSurchargeRate: PEAK_SURCHARGE_RATE
  };
};

/**
 * Format a price breakdown for display purposes
 * @param {Object} breakdown - Price breakdown object
 * @returns {Object} - Formatted breakdown for UI
 */
export const formatPriceBreakdown = (breakdown) => {
  const formatPrice = (amount) => Number(amount).toFixed(2);
  
  return {
    baseRate: formatPrice(breakdown.baseRate),
    distancePrice: formatPrice(breakdown.distancePrice),
    timePrice: formatPrice(breakdown.timePrice),
    vehicleAdjustment: formatPrice(breakdown.vehicleAdjustment),
    peakSurcharge: formatPrice(breakdown.peakSurcharge),
    driverCost: formatPrice(breakdown.driverCost),
    additionalFees: formatPrice(breakdown.additionalFees),
    subtotal: formatPrice(breakdown.subtotal),
    calculatedBase: formatPrice(breakdown.calculatedBase),
    finalBasePrice: formatPrice(breakdown.finalBasePrice),
    total: formatPrice(breakdown.total)
  };
};