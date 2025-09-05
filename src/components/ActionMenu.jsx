// Action menu component with responsive behavior - popover on desktop, bottom sheet on mobile
import React, { useState, useRef, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { MenuDotsIcon, XIcon } from './Icons';

export default function ActionMenu({ actions, disabled = false, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useResponsive();
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    action.onClick();
    setIsOpen(false);
  };

  const availableActions = actions.filter(action => !action.hidden);

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Menu trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          p-2 rounded-lg transition-colors duration-200
          ${disabled 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200'
          }
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
          ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}
        `}
        aria-label="More actions"
        aria-expanded={isOpen}
      >
        <MenuDotsIcon className="w-5 h-5" />
      </button>

      {/* Mobile bottom sheet */}
      {isMobile && isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Bottom sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-xl shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Actions */}
            <div className="px-2 py-4 pb-8">
              {availableActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-4 text-left rounded-lg
                    hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200
                    ${action.destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}
                    min-h-[56px]
                  `}
                >
                  {action.icon && <action.icon className="w-5 h-5 flex-shrink-0" />}
                  <div>
                    <div className="font-medium">{action.label}</div>
                    {action.description && (
                      <div className="text-sm text-gray-500 mt-1">{action.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Desktop popover */}
      {!isMobile && isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-30 animate-in fade-in scale-in-95 duration-150">
          <div className="py-2">
            {availableActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left text-sm
                  hover:bg-gray-50 transition-colors duration-150
                  ${action.destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}
                  first:rounded-t-lg last:rounded-b-lg
                `}
              >
                {action.icon && <action.icon className="w-4 h-4 flex-shrink-0" />}
                <div>
                  <div>{action.label}</div>
                  {action.description && (
                    <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}