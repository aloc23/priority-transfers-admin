// StatusBlockGrid: Consistent status block display component
import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

export default function StatusBlockGrid({ 
  title, 
  statusData = [], 
  selectedStatus = null, 
  onStatusClick = null,
  className = "" 
}) {
  const { isMobile } = useResponsive();

  return (
    <div className={`card ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className={`grid gap-3 ${
        isMobile 
          ? 'grid-cols-2' 
          : statusData.length <= 4 
            ? 'grid-cols-2 sm:grid-cols-4' 
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      }`}>
        {statusData.map((status) => (
          <button
            key={status.id}
            className={`
              rounded-lg p-3 text-left transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-purple-400
              ${status.color || 'bg-gradient-to-r from-slate-400 to-slate-500'}
              ${selectedStatus === status.id ? 'ring-2 ring-purple-400 scale-105' : ''}
              ${onStatusClick ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : 'cursor-default'}
              ${isMobile ? 'min-h-[70px]' : 'min-h-[80px]'}
            `}
            onClick={() => onStatusClick?.(selectedStatus === status.id ? null : status.id)}
            disabled={!onStatusClick}
          >
            <div className="font-semibold text-sm text-white/90 mb-1">
              {status.label}
            </div>
            <div className="text-xl font-bold text-white">
              {status.count}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}