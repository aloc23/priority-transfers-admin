import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, TodayIcon } from './Icons';

const ModernDatePicker = ({ 
  currentDate, 
  onNavigate, 
  onToday, 
  onDateSelect,
  className = "",
  isMobile = false,
  showTodayButton = true,
  showDateDisplay = true,
  compact = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayDate, setDisplayDate] = useState(moment(currentDate));
  const dropdownRef = useRef(null);

  useEffect(() => {
    setDisplayDate(moment(currentDate));
  }, [currentDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (direction) => {
    const newDate = moment(currentDate).add(direction === 'next' ? 1 : -1, 'month');
    onNavigate(newDate.toDate());
  };

  const handleDateClick = (date) => {
    onDateSelect && onDateSelect(date);
    setShowDropdown(false);
  };

  // Calculate dropdown position based on mobile context
  const getDropdownPosition = () => {
    if (isMobile) {
      return 'absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50';
    }
    return 'absolute top-full left-0 mt-2 z-50';
  };

  const renderCalendarGrid = () => {
    const startOfMonth = displayDate.clone().startOf('month');
    const endOfMonth = displayDate.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week');
    const endOfWeek = endOfMonth.clone().endOf('week');

    const days = [];
    const current = startOfWeek.clone();

    while (current.isSameOrBefore(endOfWeek)) {
      days.push(current.clone());
      current.add(1, 'day');
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className={`
        bg-white rounded-xl shadow-2xl border border-slate-200/60 backdrop-blur-lg z-50
        ${isMobile ? 'p-3 min-w-[280px] max-w-[300px]' : 'p-4 min-w-[280px] max-w-[320px]'}
      `}>
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setDisplayDate(prev => prev.clone().subtract(1, 'month'))}
            className={`
              ${isMobile ? 'p-3 min-h-[44px] min-w-[44px]' : 'p-2'} 
              rounded-lg hover:bg-slate-100 transition-colors duration-200 
              focus:outline-none focus:ring-2 focus:ring-blue-300 
              flex items-center justify-center
            `}
            aria-label="Previous month"
          >
            <ChevronLeftIcon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} text-slate-600`} />
          </button>
          
          <div className={`font-semibold text-slate-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
            {displayDate.format(isMobile ? 'MMM YYYY' : 'MMMM YYYY')}
          </div>
          
          <button
            onClick={() => setDisplayDate(prev => prev.clone().add(1, 'month'))}
            className={`
              ${isMobile ? 'p-3 min-h-[44px] min-w-[44px]' : 'p-2'} 
              rounded-lg hover:bg-slate-100 transition-colors duration-200 
              focus:outline-none focus:ring-2 focus:ring-blue-300 
              flex items-center justify-center
            `}
            aria-label="Next month"
          >
            <ChevronRightIcon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} text-slate-600`} />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {/* Week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className={`
                text-xs font-medium text-slate-500 text-center
                ${isMobile ? 'p-1.5' : 'p-2'}
              `}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1">
              {week.map((day) => {
                const isCurrentMonth = day.month() === displayDate.month();
                const isToday = day.isSame(moment(), 'day');
                const isSelected = day.isSame(moment(currentDate), 'day');
                
                return (
                  <button
                    key={day.format('YYYY-MM-DD')}
                    onClick={() => handleDateClick(day.toDate())}
                    className={`
                      ${isMobile ? 'p-2.5 min-h-[44px] min-w-[44px] text-sm' : 'p-2 text-sm'} 
                      rounded-lg transition-all duration-200 hover:scale-105 
                      focus:outline-none focus:ring-2 focus:ring-blue-300
                      flex items-center justify-center
                      ${isCurrentMonth 
                        ? isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg'
                          : isToday
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold'
                            : 'text-slate-700 hover:bg-accent/10'
                        : 'text-slate-400'
                      }
                    `}
                  >
                    {day.format('D')}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Today button */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <button
            onClick={() => {
              const today = new Date();
              onToday && onToday();
              handleDateClick(today);
            }}
            className={`
              w-full ${isMobile ? 'px-4 py-3 min-h-[44px]' : 'px-4 py-2'} 
              bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg 
              font-medium shadow-lg hover:shadow-xl transition-all duration-300 
              transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50
            `}
          >
            Go to Today
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
        {/* Navigation buttons */}
        <button
          onClick={() => handleNavigate('prev')}
          className={`
            ${compact ? 'p-1.5' : 'p-2'} rounded-xl hover:bg-white/60 transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm border border-white/30 
            shadow-sm hover:shadow-md transform hover:scale-105
            ${isMobile ? 'touch-manipulation' : ''}
          `}
          aria-label="Previous Month"
        >
          <ChevronLeftIcon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-slate-600`} />
        </button>

        {/* Date display with dropdown trigger */}
        {showDateDisplay && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`
              ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} font-bold 
              bg-gradient-to-r from-slate-100/90 to-slate-50/90 hover:from-slate-200 hover:to-slate-100 
              text-slate-700 rounded-xl transition-all duration-200 transform hover:scale-105 
              focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm border border-slate-200/50 
              shadow-sm hover:shadow-md flex items-center gap-2
              ${isMobile ? 'touch-manipulation' : ''}
            `}
            aria-label="Select date"
          >
            <CalendarIcon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-slate-500`} />
            <span className="font-semibold">
              {isMobile ? moment(currentDate).format('MMM YYYY') : moment(currentDate).format('MMMM YYYY')}
            </span>
          </button>
        )}

        {/* Today button */}
        {showTodayButton && (
          <button
            onClick={onToday}
            className={`
              ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} font-bold 
              bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 
              rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 
              shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm flex items-center gap-1.5
              ${isMobile ? 'touch-manipulation' : ''}
            `}
            aria-label="Go to today"
          >
            <TodayIcon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>Today</span>
          </button>
        )}

        {/* Next button */}
        <button
          onClick={() => handleNavigate('next')}
          className={`
            ${compact ? 'p-1.5' : 'p-2'} rounded-xl hover:bg-white/60 transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm border border-white/30 
            shadow-sm hover:shadow-md transform hover:scale-105
            ${isMobile ? 'touch-manipulation' : ''}
          `}
          aria-label="Next Month"
        >
          <ChevronRightIcon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-slate-600`} />
        </button>
      </div>

      {/* Dropdown calendar */}
      {showDropdown && (
        <div className={getDropdownPosition()}>
          {renderCalendarGrid()}
        </div>
      )}
    </div>
  );
};

export default ModernDatePicker;