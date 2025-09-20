import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  id = '',
  isMobile = false // Add mobile prop
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

  // Custom input component for the DatePicker
  const CustomInput = React.forwardRef(({ value, onClick, placeholder, isMobile: inputIsMobile, disabled }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type="text"
        value={value || ''}
        placeholder={placeholder}
        readOnly
        required={required}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            onClick && onClick();
          }
        }}
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
  ));

  // Detect if we're on mobile by checking viewport width
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640;
  const effectiveIsMobile = isMobile || isSmallScreen;

  // Convert selected date to Date object for react-datepicker
  const selectedDateObject = selectedDate ? moment(selectedDate).toDate() : null;
  const minDateObject = minDate ? moment(minDate).toDate() : new Date();

  const renderTimeSelector = () => (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <ClockIcon className={`${effectiveIsMobile ? 'w-5 h-5' : 'w-4 h-4'} text-slate-500`} />
        <span className={`${effectiveIsMobile ? 'text-sm' : 'text-sm'} font-semibold text-slate-700`}>Select Time</span>
      </div>
      
      <div className={`grid ${effectiveIsMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-2'} mb-3`}>
        {['09:00', '12:00', '15:00', '18:00'].map(time => (
          <button
            key={time}
            type="button"
            onClick={() => handleQuickTimeSelect(time)}
            className={`
              ${effectiveIsMobile ? 'px-2 py-2.5 min-h-[44px] text-xs' : 'px-2 py-2 text-xs'} 
              rounded-lg transition-colors duration-200 
              focus:outline-none focus:ring-2 focus:ring-blue-300
              flex items-center justify-center
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
          className={`
            flex-1 px-3 border border-slate-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm
            ${effectiveIsMobile ? 'py-2.5 min-h-[44px]' : 'py-2'}
          `}
        />
      </div>
    </div>
  );

  const renderActionButtons = () => (
    <div className={`flex gap-2 ${effectiveIsMobile ? 'mt-4' : 'mt-4'} pt-3 border-t border-slate-200`}>
      <button
        type="button"
        onClick={() => {
          const now = moment();
          handleDateSelect(now.toDate());
          handleTimeChange(now.format('HH:mm'));
          setIsOpen(false);
        }}
        className={`
          flex-1 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg 
          font-medium shadow-lg hover:shadow-xl transition-all duration-300 
          transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50
          ${effectiveIsMobile ? 'py-3 min-h-[44px]' : 'py-2'}
        `}
      >
        Now
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className={`
          px-4 bg-slate-100 text-slate-700 rounded-lg font-medium 
          hover:bg-slate-200 transition-colors duration-200 
          focus:outline-none focus:ring-2 focus:ring-slate-300
          ${effectiveIsMobile ? 'py-3 min-h-[44px]' : 'py-2'}
        `}
      >
        Done
      </button>
    </div>
  );

  const getDropdownPosition = () => {
    if (typeof window === 'undefined') return 'absolute top-full left-0 mt-2 z-50';
    
    const isSmallScreen = window.innerWidth < 640;
    const effectiveIsMobile = isMobile || isSmallScreen;
    
    if (effectiveIsMobile) {
      return 'absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50';
    }
    return 'absolute top-full left-0 mt-2 z-50';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block mb-2 text-sm font-bold text-gray-800">
          {label} {required && <span className="text-red-500" aria-label="required">*</span>}
        </label>
      )}
      
      <DatePicker
        selected={selectedDateObject}
        onChange={(date) => {
          if (date) {
            handleDateSelect(date);
          }
        }}
        minDate={minDateObject}
        customInput={
          <CustomInput 
            placeholder={placeholder} 
            isMobile={effectiveIsMobile}
            disabled={disabled}
          />
        }
        open={isOpen}
        onClickOutside={() => setIsOpen(false)}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        onSelect={() => {
          // Don't close automatically - let user select time too
        }}
        shouldCloseOnSelect={false}
        showPopperArrow={false}
        popperClassName="react-datepicker-popper-custom"
        popperPlacement={effectiveIsMobile ? "bottom" : "bottom-start"}
        calendarClassName="react-datepicker-custom"
        dayClassName={(date) => {
          const today = new Date();
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDateObject && date.toDateString() === selectedDateObject.toDateString();
          
          let className = "react-datepicker-day-custom";
          
          if (isSelected) {
            className += " selected";
          } else if (isToday) {
            className += " today";
          }
          
          return className;
        }}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between mb-4 px-2">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className={`
                ${effectiveIsMobile ? 'p-3 min-h-[44px] min-w-[44px]' : 'p-2'} 
                rounded-lg hover:bg-slate-100 transition-colors duration-200 
                focus:outline-none focus:ring-2 focus:ring-blue-300
                flex items-center justify-center
                ${prevMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label="Previous month"
            >
              ←
            </button>
            
            <div className={`font-semibold text-slate-800 ${effectiveIsMobile ? 'text-base' : 'text-lg'}`}>
              {moment(date).format(effectiveIsMobile ? 'MMM YYYY' : 'MMMM YYYY')}
            </div>
            
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className={`
                ${effectiveIsMobile ? 'p-3 min-h-[44px] min-w-[44px]' : 'p-2'} 
                rounded-lg hover:bg-slate-100 transition-colors duration-200 
                focus:outline-none focus:ring-2 focus:ring-blue-300
                flex items-center justify-center
                ${nextMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label="Next month"
            >
              →
            </button>
          </div>
        )}
        calendarContainer={({ children }) => (
          <div className={`
            bg-white rounded-xl shadow-2xl border border-slate-200/60 backdrop-blur-lg z-50
            ${effectiveIsMobile ? 'p-3 min-w-[320px] max-w-[380px] w-[320px]' : 'p-4 min-w-[400px] max-w-[440px] w-[420px]'}
          `}>
            {children}
            {renderTimeSelector()}
            {renderActionButtons()}
          </div>
        )}
      />

      {helpText && (
        <p id={`${id}-help`} className="mt-1 text-xs text-gray-600">{helpText}</p>
      )}
    </div>
  );
};

export default DateTimePicker;