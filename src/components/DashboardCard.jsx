import React from "react";

/**
 * DashboardCard - A reusable card component for dashboard stats
 * Props:
 * - icon: React component for the icon
 * - name: string (metric name)
 * - value: string or number (main value)
 * - dateRange: string (date range to display)
 * - change: string (e.g. '+4.98% ↑')
 * - changeColor: string (Tailwind color classes for change indicator)
 * - dropdownOptions: array of strings (e.g. ['Month', 'Quarter', 'Year'])
 * - onDropdownChange: function
 * - moreOptions: boolean (show more options button)
 * - className: string (extra classes)
 */
export default function DashboardCard({
  icon: Icon,
  name,
  value,
  dateRange,
  change,
  changeColor = "bg-green-100 text-green-700",
  dropdownOptions = ["Month", "Quarter", "Year"],
  onDropdownChange,
  moreOptions = true,
  className = "",
  children,
}) {
  return (
    <div
      className={`relative bg-slate-50 rounded-2xl shadow-2xl border-2 border-slate-300 p-8 flex flex-col gap-4 mb-6 hover:shadow-3xl transition-all duration-200 group ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 shadow">
            <Icon className="w-6 h-6 text-white" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">{name}</span>
            {dateRange && (
              <span className="text-xs text-slate-500">{dateRange}</span>
            )}
          </div>
        </div>
        {moreOptions && (
          <button
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
            title="More options"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="19" cy="12" r="2" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
      {/* Main Value & Change */}
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-extrabold text-slate-900 drop-shadow-sm">{value}</span>
        {change && (
          <span className={`ml-2 px-2 py-1 rounded ${changeColor} text-xs font-semibold`}>{change}</span>
        )}
      </div>
      {/* Dropdown */}
      {dropdownOptions && dropdownOptions.length > 0 && (
        <div className="mt-3 flex justify-end">
          <select
            className="bg-white/80 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-600 focus:outline-none"
            onChange={onDropdownChange}
          >
            {dropdownOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}
      {/* Extra content (children) */}
      {children}
    </div>
  );
}
