import React from 'react';
import { PlusIcon, TableIcon, CalendarIcon, DriverIcon } from './Icons';
import ThreeWayToggle from './ThreeWayToggle';
import { useAppStore } from '../context/AppStore';

const ScheduleToolbar = ({ 
  viewMode, 
  onViewModeChange, 
  onAddBooking,
  showFilters = true,
  className = ""
}) => {
  const { drivers, globalCalendarState, updateGlobalCalendarState } = useAppStore();
  const { selectedDriver } = globalCalendarState;

  return (
    <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${className}`}>
      {/* Left side: View toggle and Add button */}
      <div className="flex items-center gap-3">
        <ThreeWayToggle
          options={[
            { id: 'table', label: 'Table', icon: TableIcon, mobileLabel: 'Table' },
            { id: 'calendar', label: 'Calendar', icon: CalendarIcon, mobileLabel: 'Cal' },
            { id: 'resources', label: 'Resources', icon: DriverIcon, mobileLabel: 'Res' }
          ]}
          selected={viewMode}
          onChange={onViewModeChange}
        />
        
        <button 
          className="btn btn-primary gap-2 font-medium hover:scale-105 transition-transform duration-200 shadow-md" 
          onClick={onAddBooking}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Add Booking</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Right side: Filters and Legend */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Driver Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Filter by Driver</label>
            <select
              value={selectedDriver || ''}
              onChange={(e) => updateGlobalCalendarState({ selectedDriver: e.target.value || null })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
            >
              <option value="">All Drivers</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.name}>{driver.name}</option>
              ))}
            </select>
          </div>

          {/* Status Color Legend */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Booking Types</label>
            <div className="flex gap-3 items-center text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                <span className="text-gray-600">Priority</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <span className="text-gray-600">Tour</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                <span className="text-gray-600">Outsourced</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleToolbar;