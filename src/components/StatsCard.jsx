// StatsCard: displays a single stat with icon, label, and value
import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

export default function StatsCard({ icon: Icon, label, value, className = '', onClick }) {
  const { isMobile, isSmallMobile } = useResponsive();
  
  // Color palette for KPIs
  const colorMap = {
    Revenue: 'bg-gradient-to-r from-green-400 via-green-300 to-green-200',
    Bookings: 'bg-gradient-to-r from-purple-400 via-purple-300 to-purple-200',
    Customers: 'bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200',
    Drivers: 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200',
    Vehicles: 'bg-gradient-to-r from-pink-400 via-pink-300 to-pink-200',
    Partners: 'bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-200',
    Expenses: 'bg-gradient-to-r from-red-400 via-red-300 to-red-200',
    Estimations: 'bg-gradient-to-r from-teal-400 via-teal-300 to-teal-200',
    'Net Profit': 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300',
    // New entries for improved labels
    'Total Income': 'bg-gradient-to-r from-green-400 via-green-300 to-green-200',
    'Paid Invoices': 'bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200',
    'Total Expenses': 'bg-gradient-to-r from-red-400 via-red-300 to-red-200',
    'Active Customers': 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-200',
    'Available Drivers': 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200',
    'Active Vehicles': 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200',
  };
  const bgClass = colorMap[label] || 'bg-gradient-to-r from-slate-100 to-slate-200';
  
  // Enhanced mobile styling and separation
  const cardClasses = `
    flex items-center gap-3 
    ${isMobile ? 'p-5 min-h-[90px]' : 'p-6'} 
    ${bgClass} rounded-2xl shadow-2xl border-2 border-slate-300 mb-5 
    transition-all duration-200 
    ${onClick ? 'cursor-pointer' : ''} 
    hover:scale-[1.03] hover:shadow-3xl 
    active:scale-[0.98] active:shadow-md
    ${isMobile ? 'active:bg-opacity-90' : ''}
    ${className}
  `.trim();

  return (
    <div
      className={cardClasses}
      aria-label={label}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className={`flex items-center justify-center ${isSmallMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-white/70 shadow`}>
        <Icon className={`${isSmallMobile ? 'w-5 h-5' : 'w-7 h-7'} text-slate-700`} aria-hidden="true" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className={`${isSmallMobile ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 leading-tight truncate`}>
          {value}
        </span>
        <span className={`${isSmallMobile ? 'text-xs' : 'text-sm'} font-medium text-slate-600 mt-1 tracking-wide truncate`}>
          {label}
        </span>
      </div>
    </div>
  );
}
