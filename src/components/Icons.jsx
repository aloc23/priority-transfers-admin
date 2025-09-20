// Professional icon components using Heroicons
import React from 'react';
import {
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TruckIcon,
  BellIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon as HeroTrashIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PrinterIcon,
  InboxIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  PhoneIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
} from '@heroicons/react/24/solid';

// Main navigation icons
export const DashboardIcon = HomeIcon;
export const BookingIcon = DocumentTextIcon;
export const CustomerIcon = UserGroupIcon;
export const DriverIcon = ({ className = "w-5 h-5", ...props }) => (
  <UserGroupIcon className={className} {...props} />
);
export const VehicleIcon = TruckIcon;
export const RevenueIcon = CurrencyDollarIcon;
export const ReportsIcon = ChartBarIcon;

// Euro-specific financial icons
export const EuroIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <path d="M9 15h6"/>
    <path d="M9 11h6"/>
    <circle cx="12" cy="13" r="1"/>
    <path d="M16 13c-1.2 0-2-.8-2-2s.8-2 2-2"/>
  </svg>
);

export const IncomeIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v20m5-5l-5-5-5 5"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M8 12h8"/>
    <path d="M10 8h4"/>
  </svg>
);

export const ExpenseIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22V2m-5 5l5 5 5-5"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M8 12h8"/>
    <path d="M10 16h4"/>
  </svg>
);

export const ProfitIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
    <path d="M12 8v8"/>
    <path d="M8 12h8"/>
    <path d="M9 9l6 6"/>
    <path d="M15 9l-6 6"/>
  </svg>
);

export const PaidInvoiceIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <path d="M9 15l2 2 4-4"/>
    <path d="M9 11h6"/>
  </svg>
);

// Secondary navigation and utility icons
export { StarIcon };
export const SettingsIcon = CogIcon;
export const NotificationIcon = BellIcon;
export { CalendarIcon };
export { PlusIcon };

// Action icons
export const EditIcon = PencilIcon;
export const DeleteIcon = HeroTrashIcon;
export const TrashIcon = HeroTrashIcon;
export const ViewIcon = EyeIcon;
export const SendIcon = PaperAirplaneIcon;
export const DownloadIcon = ArrowDownTrayIcon;
export const UploadIcon = CloudArrowUpIcon;
export { ChevronDownIcon, ChevronUpIcon };

// Document and invoice icons
export const InvoiceIcon = DocumentDuplicateIcon;
export const EstimationIcon = DocumentTextIcon;

// Status and utility icons
export const HistoryIcon = ClockIcon;
export const FilterIcon = FunnelIcon;
export { CheckIcon };
export const XIcon = XMarkIcon;
export const CloseIcon = XMarkIcon;

// Hamburger menu and navigation icons
export const HamburgerIcon = Bars3Icon;
export const MenuDotsIcon = EllipsisVerticalIcon;

// Specialized icons
export const OutsourceIcon = ({ className = "w-5 h-5", ...props }) => (
  <PhoneIcon className={className} {...props} />
);

export const TrendUpIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

export const TrendDownIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

// Status icons
export const SuccessIcon = CheckCircleIconSolid;
export const WarningIcon = ExclamationTriangleIcon;
export const ErrorIcon = ExclamationCircleIconSolid;
export const InfoIcon = InformationCircleIcon;

// Print and inbox icons
export const PrintIcon = PrinterIcon;
export { InboxIcon };
export const EmptyInboxIcon = InboxIcon;
export const ReadIcon = EyeIcon;
export const UnreadIcon = ({ className = "w-5 h-5", ...props }) => (
  <div className={`${className} rounded-full bg-blue-500`} {...props} />
);

// Settings and table icons
export const SettingsListIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

// Navigation icons for calendar widget
export const TodayIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <circle cx="12" cy="15" r="2"/>
  </svg>
);

export const ChevronLeftIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
);

export const ChevronRightIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

// Logout/Sign out icon
export const LogoutIcon = ArrowRightOnRectangleIcon;