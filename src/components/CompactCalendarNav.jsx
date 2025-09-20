import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

const CompactCalendarNav = ({ 
  currentDate, 
  onNavigate, 
  onToday, 
  currentView = 'month',
  onViewChange,
  views = ['month'],
  className = "",
  isMobile = false 
}) => {
  const formatDateTitle = (date) => {
    if (currentView === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (currentView === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ${startOfWeek.getDate()}-${endOfWeek.getDate()}`;
      } else {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else if (currentView === 'day') {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (currentView === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'NEXT' ? 1 : -1));
    } else if (currentView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'NEXT' ? 7 : -7));
    } else if (currentView === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'NEXT' ? 1 : -1));
    }
    
    onNavigate(direction, newDate);
  };

  return (
    <div className={`
      ${isMobile 
        ? 'flex flex-col gap-3' 
        : 'flex items-center justify-between'
      } ${className}
    `}>
      {/* Navigation Controls */}
      <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <button
          onClick={() => handleNavigate('PREV')}
          className="p-2 rounded-lg hover:bg-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-md transform hover:scale-105"
          aria-label={`Previous ${currentView}`}
        >
          <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
        </button>
        
        <button
          onClick={onToday}
          className={`px-3 py-2 text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm ${isMobile ? 'px-2' : ''}`}
          aria-label="Go to today"
        >
          Today
        </button>
        
        <button
          onClick={() => handleNavigate('NEXT')}
          className="p-2 rounded-lg hover:bg-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-md transform hover:scale-105"
          aria-label={`Next ${currentView}`}
        >
          <ChevronRightIcon className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Mobile: Date and View Selector Row */}
      {isMobile ? (
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-800 flex-1 text-center">
            {formatDateTitle(currentDate)}
          </div>
          {/* View Selector */}
          {views.length > 1 && (
            <div className="flex gap-0.5 bg-white/80 rounded-lg p-0.5 border border-slate-200 flex-shrink-0">
              {views.map((view) => (
                <button
                  key={view}
                  onClick={() => onViewChange && onViewChange(view)}
                  className={`
                    px-2 py-1 text-xs font-medium rounded transition-colors duration-200 min-w-[32px]
                    ${currentView === view
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }
                  `}
                >
                    {view.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop: Current Date/Period Display */}
          <div className="text-base font-semibold text-slate-800">
            {formatDateTitle(currentDate)}
          </div>

          {/* Desktop: View Selector */}
          {views.length > 1 && (
            <div className="flex gap-1 bg-white/80 rounded-lg p-1 border border-slate-200">
              {views.map((view) => (
                <button
                  key={view}
                  onClick={() => onViewChange && onViewChange(view)}
                  className={`
                    px-2 py-1 text-xs font-medium rounded transition-colors duration-200
                    ${currentView === view
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }
                  `}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompactCalendarNav;