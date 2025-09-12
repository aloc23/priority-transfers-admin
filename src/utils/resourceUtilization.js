// Resource Utilization Utilities
// Calculates utilization metrics for drivers, vehicles, and outsourced resources

import moment from 'moment';

/**
 * Calculate resource utilization metrics
 * @param {Array} bookings - All bookings
 * @param {Array} drivers - All drivers  
 * @param {Array} fleet - All vehicles
 * @param {Array} partners - All partners
 * @param {Object} options - Calculation options
 * @returns {Object} Resource utilization data
 */
export function calculateResourceUtilization(bookings, drivers, fleet, partners, options = {}) {
  const {
    dateRange = 7, // Days to look ahead
    includeCompleted = true,
    includeConfirmed = true,
    includePending = false
  } = options;

  const today = moment();
  const endDate = moment().add(dateRange, 'days');
  
  // Filter bookings within date range and relevant statuses
  const relevantBookings = bookings.filter(booking => {
    const bookingDate = moment(booking.date);
    if (!bookingDate.isValid()) return false;
    
    const inDateRange = bookingDate.isBetween(today, endDate, null, '[]');
    const relevantStatus = (
      (includeCompleted && booking.status === 'completed') ||
      (includeConfirmed && booking.status === 'confirmed') ||  
      (includePending && booking.status === 'pending')
    );
    
    return inDateRange && relevantStatus;
  });

  // Calculate driver utilization
  const driverUtilization = drivers.map(driver => {
    const driverBookings = relevantBookings.filter(b => b.driver === driver.name);
    const totalHours = calculateTotalBookingHours(driverBookings);
    const workingHoursInPeriod = dateRange * 8; // Assume 8 hour work days
    
    return {
      ...driver,
      type: 'driver',
      resourceType: 'internal',
      bookings: driverBookings,
      totalHours,
      utilization: workingHoursInPeriod > 0 ? (totalHours / workingHoursInPeriod) * 100 : 0,
      availability: driver.status === 'available' ? 'available' : 'busy',
      upcomingBookings: driverBookings.filter(b => moment(b.date).isAfter(today)),
      currentBooking: driverBookings.find(b => 
        moment(b.date).isSame(today, 'day') && 
        b.status === 'confirmed'
      )
    };
  });

  // Calculate vehicle utilization
  const vehicleUtilization = fleet.map(vehicle => {
    const vehicleBookings = relevantBookings.filter(b => 
      b.vehicle === vehicle.name || b.vehicle === vehicle.id
    );
    const totalHours = calculateTotalBookingHours(vehicleBookings);
    const availableHoursInPeriod = dateRange * 12; // Assume 12 hours availability per day
    
    return {
      ...vehicle,
      type: 'vehicle', 
      resourceType: 'internal',
      bookings: vehicleBookings,
      totalHours,
      utilization: availableHoursInPeriod > 0 ? (totalHours / availableHoursInPeriod) * 100 : 0,
      availability: vehicleBookings.some(b => 
        moment(b.date).isSame(today, 'day') && b.status === 'confirmed'
      ) ? 'busy' : 'available',
      upcomingBookings: vehicleBookings.filter(b => moment(b.date).isAfter(today))
    };
  });

  // Calculate outsourced partner utilization
  const partnerUtilization = partners.map(partner => {
    const partnerBookings = relevantBookings.filter(b => 
      b.type === 'outsourced' && b.partner === partner.name
    );
    const totalHours = calculateTotalBookingHours(partnerBookings);
    const estimatedCapacityHours = dateRange * 10; // Assume 10 hours capacity per day
    
    return {
      ...partner,
      type: 'partner',
      resourceType: 'outsourced', 
      bookings: partnerBookings,
      totalHours,
      utilization: estimatedCapacityHours > 0 ? (totalHours / estimatedCapacityHours) * 100 : 0,
      availability: partner.status === 'active' ? 'available' : 'unavailable',
      upcomingBookings: partnerBookings.filter(b => moment(b.date).isAfter(today))
    };
  });

  // Aggregate metrics
  const allResources = [...driverUtilization, ...vehicleUtilization, ...partnerUtilization];
  const internalResources = allResources.filter(r => r.resourceType === 'internal');
  const outsourcedResources = allResources.filter(r => r.resourceType === 'outsourced');
  
  const totalBookings = relevantBookings.length;
  const internalBookings = relevantBookings.filter(b => b.type !== 'outsourced').length;
  const outsourcedBookings = relevantBookings.filter(b => b.type === 'outsourced').length;

  return {
    drivers: driverUtilization,
    vehicles: vehicleUtilization, 
    partners: partnerUtilization,
    allResources,
    internalResources,
    outsourcedResources,
    summary: {
      totalResources: allResources.length,
      internalResourcesCount: internalResources.length,
      outsourcedResourcesCount: outsourcedResources.length,
      totalBookings,
      internalBookings,
      outsourcedBookings,
      avgUtilization: allResources.length > 0 ? 
        allResources.reduce((sum, r) => sum + r.utilization, 0) / allResources.length : 0,
      availableResources: allResources.filter(r => r.availability === 'available').length,
      busyResources: allResources.filter(r => r.availability === 'busy').length
    }
  };
}

/**
 * Calculate total hours for a set of bookings
 * @param {Array} bookings - Bookings to calculate hours for
 * @returns {number} Total hours
 */
function calculateTotalBookingHours(bookings) {
  return bookings.reduce((total, booking) => {
    if (booking.type === 'tour' && booking.tourStartDate && booking.tourEndDate) {
      // Multi-day tour - calculate total hours
      const start = moment(`${booking.tourStartDate} ${booking.tourPickupTime || '08:00'}`);
      const end = moment(`${booking.tourEndDate} ${booking.tourReturnPickupTime || '18:00'}`);
      return total + end.diff(start, 'hours');
    } else {
      // Single transfer - assume 2 hours per booking (default)
      let hours = 2;
      
      // Add return trip hours if applicable
      if (booking.hasReturn) {
        hours += 2;
      }
      
      return total + hours;
    }
  }, 0);
}

/**
 * Get resource conflicts and overlaps
 * @param {Array} bookings - All bookings
 * @param {string} resourceField - Field to check for conflicts ('driver', 'vehicle', etc.)
 * @returns {Array} Array of conflicts
 */
export function getResourceConflicts(bookings, resourceField = 'driver') {
  const conflicts = [];
  const sortedBookings = [...bookings]
    .filter(b => b.status === 'confirmed' && b[resourceField])
    .sort((a, b) => moment(`${a.date} ${a.time}`).diff(moment(`${b.date} ${b.time}`)));

  for (let i = 0; i < sortedBookings.length - 1; i++) {
    const current = sortedBookings[i];
    const next = sortedBookings[i + 1];
    
    // Skip if different resources
    if (current[resourceField] !== next[resourceField]) continue;
    
    const currentEnd = moment(`${current.date} ${current.time}`).add(2, 'hours');
    const nextStart = moment(`${next.date} ${next.time}`);
    
    // Check for overlap
    if (currentEnd.isAfter(nextStart)) {
      conflicts.push({
        type: 'overlap',
        resource: current[resourceField],
        resourceField,
        booking1: current,
        booking2: next,
        overlapMinutes: currentEnd.diff(nextStart, 'minutes')
      });
    }
  }
  
  return conflicts;
}

/**
 * Get resource availability gaps
 * @param {Object} resource - Resource to check
 * @param {Array} bookings - Resource's bookings
 * @param {number} minGapHours - Minimum gap to consider
 * @returns {Array} Array of availability gaps
 */
export function getResourceGaps(resource, bookings, minGapHours = 2) {
  const sortedBookings = [...bookings]
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => moment(`${a.date} ${a.time}`).diff(moment(`${b.date} ${b.time}`)));

  const gaps = [];
  
  for (let i = 0; i < sortedBookings.length - 1; i++) {
    const current = sortedBookings[i];
    const next = sortedBookings[i + 1];
    
    const currentEnd = moment(`${current.date} ${current.time}`).add(2, 'hours');
    const nextStart = moment(`${next.date} ${next.time}`);
    
    const gapHours = nextStart.diff(currentEnd, 'hours');
    
    if (gapHours >= minGapHours) {
      gaps.push({
        start: currentEnd.toDate(),
        end: nextStart.toDate(), 
        hours: gapHours,
        resource: resource.name,
        resourceType: resource.resourceType
      });
    }
  }
  
  return gaps;
}

/**
 * Format utilization percentage for display
 * @param {number} utilization - Utilization percentage (0-100)
 * @returns {Object} Formatted utilization with color and label
 */
export function formatUtilization(utilization) {
  const percentage = Math.round(utilization);
  
  let color, label, status;
  
  if (percentage >= 90) {
    color = 'bg-red-500';
    label = 'Overbooked';
    status = 'critical';
  } else if (percentage >= 75) {
    color = 'bg-orange-500';
    label = 'High';
    status = 'high';  
  } else if (percentage >= 50) {
    color = 'bg-green-500';
    label = 'Good';
    status = 'good';
  } else if (percentage >= 25) {
    color = 'bg-blue-500';  
    label = 'Low';
    status = 'low';
  } else {
    color = 'bg-gray-500';
    label = 'Very Low';  
    status = 'minimal';
  }
  
  return {
    percentage,
    color,
    label,
    status,
    display: `${percentage}%`
  };
}