// ResourceStatusBlock: Enhanced resource status display for dashboard
import { useMemo } from 'react';
import { useAppStore } from '../context/AppStore';
import { useFleet } from '../context/FleetContext';
import { useResponsive } from '../hooks/useResponsive';
import { calculateResourceUtilization, formatUtilization } from '../utils/resourceUtilization';
import { DriverIcon, VehicleIcon, OutsourceIcon, HistoryIcon, CalendarIcon } from './Icons';
import StatusBlockGrid from './StatusBlockGrid';

export default function ResourceStatusBlock({ compact = false }) {
  const { bookings, drivers, partners } = useAppStore();
  const { fleet } = useFleet();
  const { isMobile } = useResponsive();

  // Calculate resource utilization for the next 7 days
  const resourceData = useMemo(() => {
    return calculateResourceUtilization(bookings, drivers, fleet, partners || [], {
      dateRange: 7,
      includeConfirmed: true,
      includePending: true
    });
  }, [bookings, drivers, fleet, partners]);

  // Prepare status data for different resource types
  const driverStatusData = useMemo(() => {
    const { drivers } = resourceData;
    const available = drivers.filter(d => d.availability === 'available').length;
    const busy = drivers.filter(d => d.availability === 'busy').length;
    const avgUtilization = drivers.length > 0 ? 
      drivers.reduce((sum, d) => sum + d.utilization, 0) / drivers.length : 0;

    return [
      {
        id: 'total-drivers',
        label: 'Total Drivers',
        count: drivers.length,
        color: 'bg-gradient-to-r from-blue-500 to-blue-400',
        icon: DriverIcon
      },
      {
        id: 'available-drivers', 
        label: 'Available',
        count: available,
        color: 'bg-gradient-to-r from-green-500 to-green-400',
        icon: DriverIcon
      },
      {
        id: 'busy-drivers',
        label: 'Busy',
        count: busy, 
        color: 'bg-gradient-to-r from-orange-500 to-orange-400',
        icon: DriverIcon
      },
      {
        id: 'driver-utilization',
        label: 'Avg Utilization',
        count: `${Math.round(avgUtilization)}%`,
        color: avgUtilization > 75 ? 'bg-gradient-to-r from-red-500 to-red-400' :
               avgUtilization > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
               'bg-gradient-to-r from-green-500 to-green-400',
        icon: HistoryIcon
      }
    ];
  }, [resourceData]);

  const vehicleStatusData = useMemo(() => {
    const { vehicles } = resourceData;
    const available = vehicles.filter(v => v.availability === 'available').length;
    const busy = vehicles.filter(v => v.availability === 'busy').length;
    const avgUtilization = vehicles.length > 0 ?
      vehicles.reduce((sum, v) => sum + v.utilization, 0) / vehicles.length : 0;

    return [
      {
        id: 'total-vehicles',
        label: 'Total Vehicles',
        count: vehicles.length,
        color: 'bg-gradient-to-r from-purple-500 to-purple-400',
        icon: VehicleIcon
      },
      {
        id: 'available-vehicles',
        label: 'Available', 
        count: available,
        color: 'bg-gradient-to-r from-green-500 to-green-400',
        icon: VehicleIcon
      },
      {
        id: 'busy-vehicles',
        label: 'Busy',
        count: busy,
        color: 'bg-gradient-to-r from-orange-500 to-orange-400', 
        icon: VehicleIcon
      },
      {
        id: 'vehicle-utilization',
        label: 'Avg Utilization',
        count: `${Math.round(avgUtilization)}%`,
        color: avgUtilization > 75 ? 'bg-gradient-to-r from-red-500 to-red-400' :
               avgUtilization > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
               'bg-gradient-to-r from-green-500 to-green-400',
        icon: HistoryIcon
      }
    ];
  }, [resourceData]);

  const outsourcedStatusData = useMemo(() => {
    const { partners } = resourceData;
    const active = partners.filter(p => p.availability === 'available').length;
    const totalBookings = partners.reduce((sum, p) => sum + p.bookings.length, 0);
    const avgUtilization = partners.length > 0 ?
      partners.reduce((sum, p) => sum + p.utilization, 0) / partners.length : 0;

    return [
      {
        id: 'total-partners',
        label: 'Partners',
        count: partners.length,
        color: 'bg-gradient-to-r from-orange-500 to-amber-400',
        icon: OutsourceIcon
      },
      {
        id: 'active-partners',
        label: 'Active',
        count: active,
        color: 'bg-gradient-to-r from-green-500 to-green-400',
        icon: OutsourceIcon
      },
      {
        id: 'outsourced-bookings',
        label: 'Bookings',
        count: totalBookings,
        color: 'bg-gradient-to-r from-blue-500 to-blue-400',
        icon: CalendarIcon
      },
      {
        id: 'partner-utilization',
        label: 'Avg Utilization', 
        count: `${Math.round(avgUtilization)}%`,
        color: avgUtilization > 75 ? 'bg-gradient-to-r from-red-500 to-red-400' :
               avgUtilization > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
               'bg-gradient-to-r from-green-500 to-green-400',
        icon: HistoryIcon
      }
    ];
  }, [resourceData]);

  // Combined resource overview
  const combinedStatusData = useMemo(() => {
    const { summary } = resourceData;
    
    return [
      {
        id: 'total-resources',
        label: 'Total Resources',
        count: summary.totalResources,
        color: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
        icon: CalendarIcon
      },
      {
        id: 'available-resources',
        label: 'Available',
        count: summary.availableResources,
        color: 'bg-gradient-to-r from-green-500 to-green-400',
        icon: CalendarIcon
      },
      {
        id: 'busy-resources', 
        label: 'Busy',
        count: summary.busyResources,
        color: 'bg-gradient-to-r from-orange-500 to-orange-400',
        icon: CalendarIcon
      },
      {
        id: 'avg-utilization',
        label: 'Avg Utilization',
        count: `${Math.round(summary.avgUtilization)}%`,
        color: summary.avgUtilization > 75 ? 'bg-gradient-to-r from-red-500 to-red-400' :
               summary.avgUtilization > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
               'bg-gradient-to-r from-green-500 to-green-400',
        icon: HistoryIcon
      }
    ];
  }, [resourceData]);

  // Individual resource details with utilization
  const renderResourceDetail = (resource) => {
    const utilization = formatUtilization(resource.utilization);
    const ResourceIcon = resource.type === 'driver' ? DriverIcon :
                        resource.type === 'vehicle' ? VehicleIcon : OutsourceIcon;
    
    return (
      <div key={`${resource.type}-${resource.id || resource.name}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            resource.type === 'driver' ? 'bg-blue-100' :
            resource.type === 'vehicle' ? 'bg-purple-100' : 'bg-orange-100'
          }`}>
            <ResourceIcon className={`w-4 h-4 ${
              resource.type === 'driver' ? 'text-blue-600' :
              resource.type === 'vehicle' ? 'text-purple-600' : 'text-orange-600'
            }`} />
          </div>
          
          <div>
            <div className="font-medium text-sm">{resource.name}</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className={`w-2 h-2 rounded-full ${
                resource.availability === 'available' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              {resource.availability}
              {resource.resourceType === 'outsourced' && (
                <span className="bg-orange-100 text-orange-700 px-1 rounded text-xs">Outsourced</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${utilization.color} text-white`}>
            {utilization.display}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {resource.upcomingBookings.length} upcoming
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Combined Status Overview */}
        <StatusBlockGrid
          title="Resource Status Overview"
          statusData={combinedStatusData}
          cardClassName="backdrop-blur-md bg-white/90 border border-slate-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200"
          countClassName="text-xl font-bold text-white drop-shadow-sm"
          labelClassName="text-xs font-medium text-white/90 uppercase tracking-wider"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Combined Overview */}
      <StatusBlockGrid
        title="Resource Status Overview"
        statusData={combinedStatusData}
        cardClassName="backdrop-blur-md bg-white/90 border border-slate-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200"
        countClassName="text-xl font-bold text-white drop-shadow-sm"
        labelClassName="text-xs font-medium text-white/90 uppercase tracking-wider"
      />

      {/* Detailed Breakdown */}
      {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drivers */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DriverIcon className="w-5 h-5 text-blue-600" />
              Drivers ({resourceData.drivers.length})
            </h4>
            <StatusBlockGrid
              statusData={driverStatusData}
              cardClassName="bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"
              countClassName="text-lg font-bold text-blue-800"
              labelClassName="text-xs font-medium text-blue-600"
            />
          </div>

          {/* Vehicles */} 
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <VehicleIcon className="w-5 h-5 text-purple-600" />
              Vehicles ({resourceData.vehicles.length})
            </h4>
            <StatusBlockGrid
              statusData={vehicleStatusData}
              cardClassName="bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all duration-200"
              countClassName="text-lg font-bold text-purple-800"
              labelClassName="text-xs font-medium text-purple-600"
            />
          </div>

          {/* Outsourced Partners */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <OutsourceIcon className="w-5 h-5 text-orange-600" />
              Outsourced ({resourceData.partners.length})
            </h4>
            <StatusBlockGrid
              statusData={outsourcedStatusData}
              cardClassName="bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all duration-200"
              countClassName="text-lg font-bold text-orange-800"
              labelClassName="text-xs font-medium text-orange-600"
            />
          </div>
        </div>
      )}

      {/* Individual Resource List */}
      {!compact && !isMobile && (
        <div className="card">
          <h4 className="font-semibold text-gray-900 mb-4">Resource Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resourceData.allResources.slice(0, 8).map(renderResourceDetail)}
          </div>
          {resourceData.allResources.length > 8 && (
            <div className="text-center mt-4">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Resources ({resourceData.allResources.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}