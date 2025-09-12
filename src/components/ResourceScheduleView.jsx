// ResourceScheduleView: Timeline/Gantt-style view for all resources
import { useState, useMemo } from 'react';
import moment from 'moment';
import { useAppStore } from '../context/AppStore';
import { useFleet } from '../context/FleetContext';
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
  const { bookings, drivers, partners = [], updateBooking, addBooking, globalCalendarState, updateGlobalCalendarState } = useAppStore();
  const { fleet } = useFleet();
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
    return calculateResourceUtilization(bookings, drivers, fleet, partners, {
      dateRange: 7,
      includeConfirmed: true,
      includePending: true
    });
  }, [bookings, drivers, fleet, partners]);

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
                // For tours, show the booking only on the start and end dates
                const tourStart = moment(booking.tourStartDate);
                const tourEnd = moment(booking.tourEndDate);
                return tourStart.isSame(day, 'day') || tourEnd.isSame(day, 'day');
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
                className="flex-1 min-h-[80px] border-r border-gray-200 p-1 relative cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleQuickBooking(resource, day)}
              >
                {/* Day bookings */}
                <div className="space-y-1">
                  {dayBookings.map(booking => {
                    const isOutsourced = booking.source === 'outsourced' || booking.type === 'outsourced';
                    const bookingColors = isOutsourced ? 
                      { bg: 'bg-orange-500', text: 'text-white' } :
                      BOOKING_TYPE_COLORS[booking.type] || BOOKING_TYPE_COLORS.single;
                    
                    const bookingTime = booking.type === 'tour' ? 
                      `${booking.tourPickupTime || '09:00'} - ${booking.tourReturnPickupTime || '17:00'}` :
                      booking.time;
                    
                    const titleInfo = booking.type === 'tour' ?
                      `${booking.customer} - Tour: ${booking.pickup} → ${booking.destination} (${booking.tourStartDate} to ${booking.tourEndDate})` :
                      `${booking.customer} - ${booking.pickup} → ${booking.destination} (${bookingTime})${booking.hasReturn && booking.returnDate ? ` + Return: ${booking.returnDate} ${booking.returnTime}` : ''}`;
                    
                    return (
                      <div 
                        key={booking.id}
                        className={`text-xs p-1.5 rounded ${bookingColors.bg} ${bookingColors.text} cursor-pointer hover:opacity-80 border-l-2 ${isOutsourced ? 'border-orange-300' : 'border-transparent'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResource({ resource, booking });
                        }}
                        title={titleInfo}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {isOutsourced && <span className="text-xs">🚐</span>}
                          <div className="font-medium truncate">{booking.customer}</div>
                        </div>
                        
                        {booking.type === 'tour' ? (
                          <div className="text-xs space-y-0.5">
                            <div>Tour: {booking.tourPickupTime || '09:00'} - {booking.tourReturnPickupTime || '17:00'}</div>
                            <div className="opacity-75">{booking.tourStartDate} to {booking.tourEndDate}</div>
                          </div>
                        ) : (
                          <div className="text-xs space-y-0.5">
                            <div>{booking.time}</div>
                            {booking.hasReturn && booking.returnDate && (
                              <div className="opacity-75">Return: {booking.returnDate}</div>
                            )}
                          </div>
                        )}
                        
                        {isOutsourced && booking.partner && (
                          <div className="text-xs opacity-75 truncate" title={`Partner: ${booking.partner}`}>
                            {booking.partner}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Show conflicts if any */}
                {conflicts.some(c => 
                  c.resource === resource.name && 
                  (moment(c.booking1.date).isSame(day, 'day') || moment(c.booking2.date).isSame(day, 'day'))
                ) && (
                  <div className="absolute top-1 right-1">
                    <WarningIcon className="w-4 h-4 text-red-500" title="Booking conflict detected" />
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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