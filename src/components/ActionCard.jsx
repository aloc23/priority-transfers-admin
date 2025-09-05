import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

export default function ActionCard({ title, items, type, icon: Icon, onQuickAction }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedItems, setDismissedItems] = useState([]);

  // Safe localStorage utility
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        try {
          return sessionStorage.getItem(key);
        } catch (sessionError) {
          return null;
        }
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        try {
          sessionStorage.setItem(key, value);
        } catch (sessionError) {
          // Silently fail
        }
      }
    }
  };

  // Load expanded state from localStorage
  useEffect(() => {
    const savedState = safeLocalStorage.getItem(`actionCard_${type}_expanded`);
    if (savedState) {
      setIsExpanded(JSON.parse(savedState));
    }

    const savedDismissed = safeLocalStorage.getItem(`actionCard_${type}_dismissed`);
    if (savedDismissed) {
      setDismissedItems(JSON.parse(savedDismissed));
    }
  }, [type]);

  // Save expanded state to localStorage
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    safeLocalStorage.setItem(`actionCard_${type}_expanded`, JSON.stringify(newState));
  };

  // Handle item dismissal
  const dismissItem = (itemId) => {
    const newDismissed = [...dismissedItems, itemId];
    setDismissedItems(newDismissed);
    safeLocalStorage.setItem(`actionCard_${type}_dismissed`, JSON.stringify(newDismissed));
  };

  // Filter out dismissed items
  const visibleItems = items.filter(item => !dismissedItems.includes(item.id));

  // Color schemes for different action types
  const colorSchemes = {
    urgent: {
      bg: 'bg-gradient-to-r from-red-50 to-pink-50',
      border: 'border-red-200',
      accent: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      count: 'bg-red-100 text-red-800'
    },
    upcoming: {
      bg: 'bg-gradient-to-r from-yellow-50 to-amber-50', 
      border: 'border-yellow-200',
      accent: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      count: 'bg-yellow-100 text-yellow-800'
    },
    pending: {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-200', 
      accent: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      count: 'bg-blue-100 text-blue-800'
    }
  };

  const scheme = colorSchemes[type] || colorSchemes.pending;

  return (
    <div className={`${scheme.bg} ${scheme.border} border rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${scheme.accent} p-2 rounded-lg bg-white/70`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${scheme.accent}`}>{title}</h3>
            <p className="text-sm text-slate-500">
              {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`${scheme.count} px-2 py-1 rounded-full text-xs font-medium`}>
            {visibleItems.length}
          </span>
          <button
            onClick={toggleExpanded}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-3">
          {visibleItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No {title.toLowerCase()} items at this time</p>
            </div>
          ) : (
            visibleItems.slice(0, 5).map((item, index) => (
              <div key={item.id} className="bg-white/80 rounded-lg p-4 border border-white/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                    {item.dueDate && (
                      <p className="text-xs text-slate-500">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {item.quickActions?.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => onQuickAction && onQuickAction(item, action)}
                        className={`px-3 py-1 text-xs font-medium text-white rounded-md ${scheme.button} transition-colors`}
                        title={action.label}
                      >
                        {action.label}
                      </button>
                    ))}
                    <button
                      onClick={() => dismissItem(item.id)}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      title="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {visibleItems.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                +{visibleItems.length - 5} more items
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}