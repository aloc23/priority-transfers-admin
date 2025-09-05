// Professional SVG icon components to replace emoji icons
import React from 'react';

export const DashboardIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
);

export const BookingIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

export const CustomerIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const DriverIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
  </svg>
);

export const VehicleIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 9l1.5-4.5h11L19 9v8a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9z"/>
    <path d="M6 6h12"/>
  </svg>
);

export const RevenueIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

export const ReportsIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4v16l-4-2-4 2V4"/>
    <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
  </svg>
);

export const StarIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

export const SettingsIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export const PlusIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const EditIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export const DeleteIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

export const ViewIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const SendIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22,2 15,22 11,13 2,9"/>
  </svg>
);

export const DownloadIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export const ChevronDownIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);

export const ChevronUpIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polyline points="18,15 12,9 6,15"/>
  </svg>
);

export const InvoiceIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

export const HistoryIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

export const FilterIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
  </svg>
);

export const CheckIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

export const TrashIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

export const OutsourceIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4l3 8-3 8H8l-3-8 3-8z"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

export const SuccessIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

export const CalendarIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export const NotificationIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export const TrendUpIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

export const TrendDownIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

export const EstimationIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <path d="M9 15h6"/>
    <path d="M9 18h6"/>
    <path d="M9 12h1"/>
  </svg>
);

export const XIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const WarningIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

export const ErrorIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
);

export const InfoIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

export const CloseIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const PrintIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <polyline points="6,9 6,2 18,2 18,9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

export const InboxIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

export const EmptyInboxIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

export const ReadIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const UnreadIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

export const SettingsListIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

export const TableIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="3" x2="9" y2="21"/>
  </svg>
);