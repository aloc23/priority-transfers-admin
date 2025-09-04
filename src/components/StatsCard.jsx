// StatsCard: displays a single stat with icon, label, and value
import React from 'react';

export default function StatsCard({ icon: Icon, label, value, className = '' }) {
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
  };
  const bgClass = colorMap[label] || 'bg-gradient-to-r from-slate-100 to-slate-200';

  return (
    <div
      className={`flex items-center gap-4 p-5 ${bgClass} rounded-xl shadow-lg border border-slate-100 transition hover:scale-[1.03] hover:shadow-xl ${className}`}
      aria-label={label}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/70 shadow">
        <Icon className="w-7 h-7 text-slate-700" aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-slate-900 leading-tight">{value}</span>
        <span className="text-sm font-medium text-slate-600 mt-1 tracking-wide">{label}</span>
      </div>
    </div>
  );
}
