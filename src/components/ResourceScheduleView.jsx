// ResourceScheduleView: Timeline/Gantt-style view for all resources
import { useState, useMemo } from 'react';
import moment from 'moment';
import { useAppStore } from '../context/AppStore';
import { useResponsive } from '../hooks/useResponsive';
import { calculateResourceUtilization, getResourceConflicts, getResourceGaps, formatUtilization } from '../utils/resourceUtilization';
import { formatCurrency } from '../utils/currency';
import { 
  CalendarIcon, 
  DriverIcon, 
  VehicleIcon, 
  OutsourceIcon, 
  PlusIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WarningIcon
} from './Icons';
import BookingModal from './BookingModal';

const RESOURCE_COLORS = {
  driver: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
    icon: 'text-blue-600'
  },
  vehicle: {
    bg: 'bg-green-100',
    border: 'border-green-300', 
    text: 'text-green-800',
    icon: 'text-green-600'
  },
  partner: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-800',
    icon: 'text-orange-600'
  }
};

const BOOKING_TYPE_COLORS = {
  single: { bg: 'bg-blue-500', text: 'text-white' },
  tour: { bg: 'bg-green-500', text: 'text-white' },
  outsourced: { bg: 'bg-orange-500', text: 'text-white' }
};

export default function ResourceScheduleView() {
  const { bookings, drivers, vehicles, partners = [], updateBooking, addBooking, globalCalendarState, updateGlobalCalendarState } = useAppStore();
  const { isMobile } = useResponsive();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
  const [resourceFilter, setResourceFilter] = useState('all'); // 'all', 'internal', 'outsourced'
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const [quickBookingSlot, setQuickBookingSlot] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  // Get partners from app store
  // const partners = []; // TODO: Get from useAppStore when partners are available

  // Calculate resource utilization
  const resourceData = useMemo(() => {
    return calculateResourceUtilization(bookings, drivers, vehicles, partners, {
      dateRange: 7,
      includeConfirmed: true,
      includePending: true
    });
  }, [bookings, drivers, vehicles, partners]);

  // Generate time slots for the week view
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(currentWeekStart.clone().add(i, 'days'));
    }
    return days;
  }, [currentWeekStart]);

  // Filter resources based on current filter
  const filteredResources = useMemo(() => {
    const { drivers, vehicles, partners } = resourceData;
    
    let resources = [];
    
    if (resourceFilter === 'all' || resourceFilter === 'internal') {
      resources.push(...drivers, ...vehicles);
    }
    
    if (resourceFilter === 'all' || resourceFilter === 'outsourced') {
      resources.push(...partners);
    }
    
    return resources;
  }, [resourceData, resourceFilter]);

  // Get bookings for the current week
  const weekBookings = useMemo(() => {
    const weekEnd = currentWeekStart.clone().add(6, 'days');
    return bookings.filter(booking => {
      if (booking.type === 'tour') {
        // For tour bookings, check if the tour spans any day in the current week
        if (booking.tourStartDate && booking.tourEndDate) {
          const tourStart = moment(booking.tourStartDate);
          const tourEnd = moment(booking.tourEndDate);
          return tourStart.isSameOrBefore(weekEnd) && tourEnd.isSameOrAfter(currentWeekStart);
        }
        return false;
      } else {
        // For transfer bookings, check pickup date and return date
        const pickupDate = moment(booking.date);
        const returnDate = booking.hasReturn && booking.returnDate ? moment(booking.returnDate) : null;
        
        const pickupInWeek = pickupDate.isBetween(currentWeekStart, weekEnd, null, '[]');
        const returnInWeek = returnDate ? returnDate.isBetween(currentWeekStart, weekEnd, null, '[]') : false;
        
        return pickupInWeek || returnInWeek;
      }
    });
  }, [bookings, currentWeekStart]);

  // Get resource conflicts
  const conflicts = useMemo(() => {
    return [
      ...getResourceConflicts(weekBookings, 'driver'),
      ...getResourceConflicts(weekBookings, 'vehicle')
    ];
  }, [weekBookings]);

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => prev.clone().subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => prev.clone().add(1, 'week'));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(moment().startOf('week'));
  };

  // Quick booking handler
  const handleQuickBooking = (resource, date, time) => {
    setQuickBookingSlot({
      resource,
      date: date.format('YYYY-MM-DD'),
      time: time || '09:00',
      resourceType: resource.resourceType,
      resourceField: resource.type === 'driver' ? 'driver' : resource.type === 'vehicle' ? 'vehicle' : 'partner'
    });
    setShowQuickBooking(true);
  };

  // Render resource row
  const renderResourceRow = (resource) => {
    const resourceBookings = weekBookings.filter(booking => {
      if (resource.type === 'driver') return booking.driver === resource.name && booking.source !== 'outsourced';
      if (resource.type === 'vehicle') return (booking.vehicle === resource.name || booking.vehicle === resource.id) && booking.source !== 'outsourced';
      if (resource.type === 'partner') {
        return (booking.source === 'outsourced' || booking.type === 'outsourced') && 
               (booking.partner === resource.name || (!booking.partner && resource.name === 'City Cab Co.'));
      }
      return false;
    });

    const utilization = formatUtilization(resource.utilization);
    const resourceColors = RESOURCE_COLORS[resource.type];
    const ResourceIcon = resource.type === 'driver' ? DriverIcon : 
                        resource.type === 'vehicle' ? VehicleIcon : OutsourceIcon;

    return (
      <div key={`${resource.type}-${resource.id || resource.name}`} className="flex border-b border-gray-200">
        {/* Resource Info Column */}
        <div className={`w-48 flex-shrink-0 p-3 ${resourceColors.bg} ${resourceColors.border} border-r`}>
          <div className="flex items-center gap-2 mb-2">
            <ResourceIcon className={`w-4 h-4 ${resourceColors.icon}`} />
            <div className="font-medium text-sm truncate" title={resource.name}>
              {resource.name}
            </div>
          </div>
          
          <div className="text-xs space-y-1">
            <div className={`inline-block px-2 py-1 rounded-full ${utilization.color} text-white text-xs`}>
              {utilization.display} utilization
            </div>
            
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${
                resource.availability === 'available' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className={resourceColors.text}>
                {resource.availability}
              </span>
            </div>
            
            {resource.type === 'partner' && (
              <div className={`text-xs ${resourceColors.text}`}>
                Outsourced
              </div>
            )}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 flex">
          {weekDays.map(day => {
            const dayBookings = resourceBookings.filter(booking => {
              if (booking.type === 'tour') {
                // For tours, show continuous blocks spanning all days from start to end
                if (booking.tourStartDate && booking.tourEndDate) {
                  const tourStart = moment(booking.tourStartDate);
                  const tourEnd = moment(booking.tourEndDate);
                  return day.isBetween(tourStart, tourEnd, 'day', '[]'); // inclusive range
                }
                return false;
              } else {
                // For transfers, show on pickup date and return date
                const pickupMatch = moment(booking.date).isSame(day, 'day');
                const returnMatch = booking.hasReturn && booking.returnDate && 
                                   moment(booking.returnDate).isSame(day, 'day');
                return pickupMatch || returnMatch;
              }
            });
            
            return (
              <div 
                key={day.format('YYYY-MM-DD')} 
                className="flex-1 min-h-[80px] border-r border-gray-200 p-1 relative cursor-pointer hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => handleQuickBooking(resource, day)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleQuickBooking(resource, day);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Create booking for ${resource.name} on ${day.format('MMMM D, YYYY')}`}
              >
                {/* Day bookings */}
                <div className="space-y-1">
                  {dayBookings.map(booking => {
                    const isOutsourced = booking.source === 'outsourced' || booking.type === 'outsourced';
                    const bookingColors = isOutsourced ? 
                      { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-300' } :
                      booking.type === 'tour' ?
                      { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-300' } :
                      { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-300' };
                    
                    // For tour bookings, determine position in the tour span
                    let tourPosition = 'middle';
                    if (booking.type === 'tour' && booking.tourStartDate && booking.tourEndDate) {
                      const tourStart = moment(booking.tourStartDate);
                      const tourEnd = moment(booking.tourEndDate);
                      if (day.isSame(tourStart, 'day')) tourPosition = 'start';
                      else if (day.isSame(tourEnd, 'day')) tourPosition = 'end';
                    }
                    
                    const bookingTime = booking.type === 'tour' ? 
                      `${booking.tourPickupTime || '09:00'} - ${booking.tourReturnPickupTime || '17:00'}` :
                      booking.time;
                    
                    const titleInfo = booking.type === 'tour' ?
                      `${booking.customer} - Tour: ${booking.pickup} → ${booking.destination} (${booking.tourStartDate} to ${booking.tourEndDate})` :
                      `${booking.customer} - ${booking.pickup} → ${booking.destination} (${bookingTime})${booking.hasReturn && booking.returnDate ? ` + Return: ${booking.returnDate} ${booking.returnTime}` : ''}`;
                    
                    return (
                      <div 
                        key={booking.id}
                        className={`text-xs p-1.5 cursor-pointer hover:opacity-90 transition-all duration-200 
                          ${bookingColors.bg} ${bookingColors.text} shadow-sm
                          ${booking.type === 'tour' ? (
                            tourPosition === 'start' ? 'rounded-l-lg rounded-r-sm border-r-2 border-r-white/20' :
                            tourPosition === 'end' ? 'rounded-r-lg rounded-l-sm border-l-2 border-l-white/20' :
                            'rounded-sm border-x-2 border-x-white/20'
                          ) : 'rounded-lg'}
                          border-l-4 ${bookingColors.border}
                          ${isOutsourced ? 'ring-1 ring-orange-200' : ''}
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResource({ resource, booking });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedResource({ resource, booking });
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${booking.type === 'tour' ? 'Tour booking' : 'Transfer booking'} for ${booking.customer} - ${titleInfo}`}
                        title={titleInfo}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {isOutsourced && (
                            <svg 
                              className="w-3 h-3 text-orange-200" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h1.01M15 10h1.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/>
                            </svg>
                          )}
                          {booking.type === 'tour' && (
                            <svg 
                              className="w-3 h-3 text-white/80" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                          <div className="font-semibold truncate text-xs" aria-hidden="true">{booking.customer}</div>
                        </div>
                        
                        {booking.type === 'tour' ? (
                          <div className="text-xs space-y-0.5 opacity-90" aria-hidden="true">
                            {tourPosition === 'start' && (
                              <>
                                <div className="font-medium">Tour Begins</div>
                                <div className="text-xs opacity-75">Start: {booking.tourPickupTime || '09:00'}</div>
                              </>
                            )}
                            {tourPosition === 'end' && (
                              <>
                                <div className="font-medium">Tour Ends</div>
                                <div className="text-xs opacity-75">Return: {booking.tourReturnPickupTime || '17:00'}</div>
                              </>
                            )}
                            {tourPosition === 'middle' && (
                              <div className="font-medium text-center">Tour In Progress</div>
                            )}
                            <div className="sr-only">
                              Tour from {booking.tourStartDate} to {booking.tourEndDate} for {booking.customer}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs space-y-0.5 opacity-90" aria-hidden="true">
                            <div className="font-medium">{booking.time}</div>
                            {booking.hasReturn && booking.returnDate && (
                              <div className="opacity-75">Return: {booking.returnDate}</div>
                            )}
                          </div>
                        )}
                        
                        {isOutsourced && booking.partner && (
                          <div className="text-xs opacity-75 truncate font-medium" title={`Partner: ${booking.partner}`} aria-hidden="true">
                            {booking.partner}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Show conflicts if any - Enhanced for tour bookings */}
                {conflicts.some(c => {
                  if (c.resource !== resource.name) return false;
                  
                  // Check for conflicts considering tour date ranges
                  const hasConflictForDay = dayBookings.some(booking => {
                    if (booking.type === 'tour' && booking.tourStartDate && booking.tourEndDate) {
                      const tourStart = moment(booking.tourStartDate);
                      const tourEnd = moment(booking.tourEndDate);
                      return day.isBetween(tourStart, tourEnd, 'day', '[]');
                    }
                    return moment(booking.date).isSame(day, 'day') || 
                           (booking.returnDate && moment(booking.returnDate).isSame(day, 'day'));
                  });
                  
                  return hasConflictForDay;
                }) && (
                  <div className="absolute top-1 right-1 z-10">
                    <div className="relative group">
                      <WarningIcon className="w-5 h-5 text-red-500 bg-white rounded-full border-2 border-red-500 p-0.5 shadow-lg animate-pulse" 
                        title="Resource conflict detected - multiple bookings overlap" />
                      <div className="absolute top-6 right-0 bg-red-50 border border-red-200 rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 min-w-max">
                        <div className="text-xs text-red-800 font-medium">Double booking detected!</div>
                        <div className="text-xs text-red-600">This resource has overlapping bookings.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick booking indicator */}
                {dayBookings.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-30 transition-opacity">
                    <PlusIcon className="w-6 h-6 text-blue-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Resource Schedule View is optimized for desktop.</p>
          <p className="text-sm text-gray-500">Please use a larger screen to access this feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
            <div className="text-lg font-medium">
              {currentWeekStart.format('MMM D')} - {currentWeekStart.clone().add(6, 'days').format('MMM D, YYYY')}
            </div>
            
            <button 
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            
            <button 
              onClick={goToCurrentWeek}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-gray-500" />
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="form-select text-sm"
          >
            <option value="all">All Resources</option>
            <option value="internal">Internal Only</option>
            <option value="outsourced">Outsourced Only</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-600 mb-1">Total Resources</div>
          <div className="text-2xl font-bold text-blue-800">{filteredResources.length}</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-600 mb-1">Available</div>
          <div className="text-2xl font-bold text-green-800">
            {filteredResources.filter(r => r.availability === 'available').length}
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-sm text-orange-600 mb-1">Week Bookings</div>
          <div className="text-2xl font-bold text-orange-800">{weekBookings.length}</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-sm text-purple-600 mb-1">Conflicts</div>
          <div className="text-2xl font-bold text-purple-800">{conflicts.length}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-3">Booking Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-sm border-l-4 border-blue-300"></div>
            <span>Transfer Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-l-lg border-l-4 border-emerald-300"></div>
            <span>Tour Booking (continuous)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-sm border-l-4 border-orange-300 ring-1 ring-orange-200"></div>
            <span>Outsourced Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <WarningIcon className="w-4 h-4 text-red-500" />
            <span>Conflict Detected</span>
          </div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <div className="w-48 flex-shrink-0 p-3 bg-gray-50 border-r border-gray-200 font-medium">
            Resources
          </div>
          <div className="flex-1 flex">
            {weekDays.map(day => (
              <div key={day.format('YYYY-MM-DD')} className="flex-1 p-3 border-r border-gray-200 text-center bg-gray-50">
                <div className="font-medium">{day.format('ddd')}</div>
                <div className="text-sm text-gray-600">{day.format('MMM D')}</div>
                {day.isSame(moment(), 'day') && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resource Rows */}
        <div className="max-h-96 overflow-y-auto">
          {filteredResources.map(renderResourceRow)}
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <WarningIcon className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-800">Resource Conflicts Detected</h3>
          </div>
          <div className="space-y-1">
            {conflicts.map((conflict, idx) => (
              <div key={idx} className="text-sm text-red-700">
                <span className="font-medium">{conflict.resource}</span> has overlapping bookings: 
                {' '}<span className="text-red-600">{conflict.booking1.customer}</span> and{' '}
                <span className="text-red-600">{conflict.booking2.customer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Booking Modal */}
      {showQuickBooking && quickBookingSlot && (
        <BookingModal
          isOpen={showQuickBooking}
          onClose={() => {
            setShowQuickBooking(false);
            setQuickBookingSlot(null);
          }}
          initialDate={quickBookingSlot.date}
          initialTime={quickBookingSlot.time}
          prefilledData={{
            [quickBookingSlot.resourceField]: quickBookingSlot.resource.name,
            type: quickBookingSlot.resourceType === 'outsourced' ? 'outsourced' : 'single'
          }}
        />
      )}
    </div>
  );
}