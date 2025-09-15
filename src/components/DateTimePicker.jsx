import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import { CalendarIcon, HistoryIcon as ClockIcon } from './Icons';

const DateTimePicker = ({ 
  value = '',
  onChange,
  label,
  placeholder = 'Select date and time',
  required = false,
  disabled = false,
  className = '',
  minDate = null,
  helpText = '',
  'aria-describedby': ariaDescribedBy = '',
  id = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [displayDate, setDisplayDate] = useState(moment());
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize values from prop
  useEffect(() => {
    if (value) {
      const momentValue = moment(value);
      if (momentValue.isValid()) {
        setSelectedDate(momentValue.format('YYYY-MM-DD'));
        setSelectedTime(momentValue.format('HH:mm'));
        setDisplayDate(momentValue);
      }
    } else {
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date) => {
    const newDate = moment(date).format('YYYY-MM-DD');
    setSelectedDate(newDate);
    setDisplayDate(moment(date));
    
    // If we have both date and time, call onChange
    if (selectedTime) {
      const combinedDateTime = moment(`${newDate} ${selectedTime}`, 'YYYY-MM-DD HH:mm');
      onChange && onChange(combinedDateTime.toISOString());
    }
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    
    // If we have both date and time, call onChange
    if (selectedDate) {
      const combinedDateTime = moment(`${selectedDate} ${time}`, 'YYYY-MM-DD HH:mm');
      onChange && onChange(combinedDateTime.toISOString());
    }
  };

  const handleQuickTimeSelect = (time) => {
    handleTimeChange(time);
    if (selectedDate) {
      setIsOpen(false);
    }
  };

  const formatDisplayValue = () => {
    if (selectedDate && selectedTime) {
      const combined = moment(`${selectedDate} ${selectedTime}`, 'YYYY-MM-DD HH:mm');
      return combined.format('MMM DD, YYYY [at] HH:mm');
    }
    return '';
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
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200/60 p-4 min-w-[320px] backdrop-blur-lg z-50">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setDisplayDate(prev => prev.clone().subtract(1, 'month'))}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Previous month"
          >
            ←
          </button>
          
          <div className="font-semibold text-slate-800 text-lg">
            {displayDate.format('MMMM YYYY')}
          </div>
          
          <button
            type="button"
            onClick={() => setDisplayDate(prev => prev.clone().add(1, 'month'))}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Calendar grid */}
        <div className="space-y-1 mb-4">
          {/* Week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-xs font-medium text-slate-500 text-center p-2">
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
                const isSelected = selectedDate && day.isSame(moment(selectedDate), 'day');
                const isDisabled = minDate && day.isBefore(moment(minDate), 'day');
                
                return (
                  <button
                    key={day.format('YYYY-MM-DD')}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleDateSelect(day.toDate())}
                    className={`
                      p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300
                      ${isDisabled 
                        ? 'text-slate-300 cursor-not-allowed'
                        : isCurrentMonth 
                          ? isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg'
                            : isToday
                              ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                          : 'text-slate-400 cursor-pointer hover:bg-slate-50'
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

        {/* Time selection */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">Select Time</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {['09:00', '12:00', '15:00', '18:00'].map(time => (
              <button
                key={time}
                type="button"
                onClick={() => handleQuickTimeSelect(time)}
                className={`
                  px-3 py-2 text-sm rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300
                  ${selectedTime === time 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                `}
              >
                {time}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              const now = moment();
              handleDateSelect(now.toDate());
              handleTimeChange(now.format('HH:mm'));
              setIsOpen(false);
            }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
          >
            Now
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block mb-2 text-sm font-bold text-gray-800">
          {label} {required && <span className="text-red-500" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={formatDisplayValue()}
          placeholder={placeholder}
          readOnly
          required={required}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400 hover:border-gray-400 cursor-pointer
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          aria-describedby={ariaDescribedBy}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {helpText && (
        <p id={`${id}-help`} className="mt-1 text-xs text-gray-600">{helpText}</p>
      )}

      {/* Dropdown calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          {renderCalendarGrid()}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;