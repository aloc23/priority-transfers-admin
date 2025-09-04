// Sidebar Navigation Component - Extracted for better architecture
import { NavLink } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { useResponsive } from "../hooks/useResponsive";
import ManagementNav from "./ManagementNav";
import { 
  DashboardIcon, 
  CalendarIcon, 
  RevenueIcon, 
  ReportsIcon, 
  OutsourceIcon, 
  NotificationIcon, 
  SettingsIcon,
  TrendUpIcon,
  EstimationIcon,
  InvoiceIcon
} from "./Icons";

const navigationItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: DashboardIcon,
    roles: ["Admin", "Dispatcher", "Driver"]
  },
  {
    path: "/schedule",
    label: "Schedule",
    icon: CalendarIcon,
    roles: ["Admin", "Dispatcher", "Driver"]
  },
  {
    path: "/invoices",
    label: "Invoices",
    icon: InvoiceIcon,
    roles: ["Admin", "Dispatcher"]
  },
  {
    path: "/reports",
    label: "Reports",
    icon: ReportsIcon,
    roles: ["Admin", "Dispatcher"]
  },
  {
    path: "/finance",
    label: "Estimates & Quotes",
    icon: EstimationIcon,
    roles: ["Admin"]
  },
  {
    path: "/notifications",
    label: "Notifications",
    icon: NotificationIcon,
    roles: ["Admin", "Dispatcher", "Driver"]
  },
  {
    path: "/settings",
    label: "Settings",
    icon: SettingsIcon,
    roles: ["Admin"]
  }
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  // Helper to check if nav item should be shown for current user role
  const shouldShowNavItem = (item) => {
    return item.roles.includes(currentUser?.role);
  };
  const { currentUser, logout } = useAppStore();
  const { isMobile, isSmallMobile } = useResponsive();

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getNavLinkClasses = (isActive) => `
    block px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
    ${isActive 
      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105" 
      : "text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700 hover:shadow-md"
    }
    ${isMobile ? 'min-h-[48px] flex items-center' : ''}
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-16"} 
          ${isMobile && !sidebarOpen ? 'hidden' : ''}
          ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'}
          bg-white transition-all duration-300 ease-in-out
          ${isMobile ? '' : 'shadow-lg'}
          border-r border-slate-200
          ${isSmallMobile && sidebarOpen ? 'w-full' : ''}
        `}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <img src="./logo.svg" alt="logo" className="w-8 h-8 rounded" />
              {sidebarOpen && <span className="font-bold text-lg text-slate-800">Priority</span>}
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className={`
                px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors
                rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                ${isMobile ? 'min-h-[48px] min-w-[48px] flex items-center justify-center' : 'btn btn-outline'}
              `}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              &#9776;
            </button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto" aria-label="Main navigation">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                if (!shouldShowNavItem(item)) return null;
                const IconComponent = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink 
                      to={item.path}
                      className={({isActive}) => getNavLinkClasses(isActive)}
                      onClick={closeSidebarOnMobile}
                      tabIndex={0}
                      aria-label={item.label}
                    >
                      {!sidebarOpen && (
                        <div className="flex justify-center">
                          <IconComponent className="w-6 h-6" aria-hidden="true" />
                        </div>
                      )}
                      {sidebarOpen && (
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
                          <span>{item.label}</span>
                        </div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
              {/* Management Section - Grouped Navigation */}
              <ManagementNav 
                currentUser={currentUser} 
                sidebarOpen={sidebarOpen} 
                onMobileClick={closeSidebarOnMobile} 
              />
            </ul>
          </nav>
          {/* User info */}
          <div className={`
            p-4 border-t border-slate-200 bg-slate-50 
            ${sidebarOpen ? '' : 'text-center'}
            ${isMobile ? 'min-h-[80px]' : ''}
          `}>
            {sidebarOpen ? (
              <>
                <div className="text-xs text-slate-600 mb-1">
                  Logged in as <span className="font-semibold text-slate-800">{currentUser?.name}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">({currentUser?.role})</div>
                <button 
                  onClick={logout} 
                  className={`
                    text-xs text-purple-600 hover:text-purple-800 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                    ${isMobile ? 'min-h-[48px] w-full text-left flex items-center' : ''}
                  `}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={logout} 
                className={`
                  text-lg hover:text-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                  ${isMobile ? 'min-h-[48px] min-w-[48px] flex items-center justify-center' : ''}
                `}
                title="Logout"
                aria-label="Logout"
              >
                &#128274;
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}