// BookingsFleetGroupedWidget: Combined Bookings & Calendar with Fleet & Driver Status
import { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import ToggleSwitch from './ToggleSwitch';
import BookingsCalendarWidget from './BookingsCalendarWidget';
import FleetDriverChecker from './FleetDriverChecker';
import { CalendarIcon, VehicleIcon, TableIcon, HamburgerIcon } from './Icons';

export default function BookingsFleetGroupedWidget({ compact = false }) {
  const { isMobile } = useResponsive();
  const [viewMode, setViewMode] = useState('inline'); // 'inline' or 'tabbed'
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'fleet'

  const handleViewModeChange = (isTabbed) => {
    setViewMode(isTabbed ? 'tabbed' : 'inline');
  };

  if (viewMode === 'tabbed') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        {/* Header with Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className={`font-semibold text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>
            Bookings, Calendar & Fleet Status
          </h3>
          <ToggleSwitch
            leftLabel={isMobile ? "Side" : "Side by Side"}
            rightLabel={isMobile ? "Tabs" : "Tabbed View"}
            leftIcon={HamburgerIcon}
            rightIcon={TableIcon}
            isRight={viewMode === 'tabbed'}
            onChange={handleViewModeChange}
            className="shrink-0"
          />
        </div>

        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-200 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'bookings'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Bookings & Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'fleet'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <VehicleIcon className="w-4 h-4" />
              <span>Fleet & Driver Status</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'bookings' && (
            <div className="p-0 -m-6">
              <BookingsCalendarWidget />
            </div>
          )}
          {activeTab === 'fleet' && (
            <div className="p-0 -m-6">
              <FleetDriverChecker compact={compact} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Inline (side-by-side) view
  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className={`font-semibold text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>
            Bookings, Calendar & Fleet Status
          </h3>
          <ToggleSwitch
            leftLabel={isMobile ? "Side" : "Side by Side"}
            rightLabel={isMobile ? "Tabs" : "Tabbed View"}
            leftIcon={HamburgerIcon}
            rightIcon={TableIcon}
            isRight={viewMode === 'tabbed'}
            onChange={handleViewModeChange}
            className="shrink-0"
          />
        </div>
      </div>

      {/* Side-by-side content */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2 xl:grid-cols-2'}`}>
        <div className="min-w-0">
          <BookingsCalendarWidget />
        </div>
        <div className="min-w-0">
          <FleetDriverChecker compact={compact} />
        </div>
      </div>
    </div>
  );
}