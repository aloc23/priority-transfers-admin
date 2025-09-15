import React from 'react';

const CompactStatusChips = ({ 
  statusData, 
  selectedStatus, 
  onStatusClick, 
  className = "",
  chipClassName = "",
  isMobile = false 
}) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
      case 'upcoming':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const getSelectedColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-500 text-white border-amber-600 shadow-lg scale-105';
      case 'confirmed':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-105';
      case 'completed':
        return 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105';
      case 'cancelled':
        return 'bg-slate-500 text-white border-slate-600 shadow-lg scale-105';
      case 'upcoming':
        return 'bg-cyan-500 text-white border-cyan-600 shadow-lg scale-105';
      default:
        return 'bg-gray-500 text-white border-gray-600 shadow-lg scale-105';
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statusData.map((status) => {
        const isSelected = selectedStatus === status.id;
        const baseColors = isSelected ? getSelectedColor(status.label) : getStatusColor(status.label);
        
        return (
          <button
            key={status.id}
            onClick={() => onStatusClick(status.id)}
            className={`
              inline-flex items-center rounded-full 
              font-semibold border transition-all duration-200 
              transform hover:scale-105 focus:outline-none focus:ring-2 
              focus:ring-blue-300 focus:ring-offset-1
              ${baseColors}
              ${chipClassName}
              ${isMobile ? 'gap-1 px-2 py-1 min-h-[24px]' : 'gap-1.5 px-3 py-1.5 min-h-[28px]'}
            `}
          >
            <span className={`
              inline-flex items-center justify-center 
              rounded-full font-bold
              ${isMobile ? 'w-3.5 h-3.5 text-[10px]' : 'w-4 h-4 text-xs'} 
              ${isSelected ? 'bg-white/20' : 'bg-current opacity-20'}
            `}>
              {status.count || 0}
            </span>
            <span className={`font-semibold ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              {status.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CompactStatusChips;