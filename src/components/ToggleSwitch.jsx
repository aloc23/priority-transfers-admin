// ToggleSwitch: Compact toggle switch component for binary choices
import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

export default function ToggleSwitch({ 
  leftLabel, 
  rightLabel, 
  leftIcon: LeftIcon, 
  rightIcon: RightIcon,
  isRight = false, 
  onChange, 
  className = "" 
}) {
  const { isMobile } = useResponsive();

  return (
    <div className={`inline-flex items-center bg-gray-100 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onChange(false)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${!isRight 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
          ${isMobile ? 'px-2 py-1.5 text-xs' : ''}
        `}
      >
        {LeftIcon && <LeftIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
        {leftLabel}
      </button>
      
      <button
        onClick={() => onChange(true)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${isRight 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
          ${isMobile ? 'px-2 py-1.5 text-xs' : ''}
        `}
      >
        {RightIcon && <RightIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
        {rightLabel}
      </button>
    </div>
  );
}