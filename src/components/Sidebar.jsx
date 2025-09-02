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
  HistoryIcon, 
  NotificationIcon, 
  SettingsIcon,
  TrendUpIcon
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
    path: "/billing",
    label: "Billing",
    icon: RevenueIcon,
    roles: ["Admin"]
  },
  {
    path: "/finance",
    label: "Finance",
    icon: TrendUpIcon,
    roles: ["Admin"]
  },
  {
    path: "/reports",
    label: "Reports",
    icon: ReportsIcon,
    roles: ["Admin", "Dispatcher", "Driver"]
  },
  {
    path: "/outsource",
    label: "Outsource",
    icon: OutsourceIcon,
    roles: ["Admin"]
  },
  {
    path: "/history",
    label: "History",
    icon: HistoryIcon,
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
  const { currentUser, logout } = useAppStore();
  const { isMobile, isSmallMobile } = useResponsive();

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getNavLinkClasses = (isActive) => `
    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
    ${isActive 
      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }
    ${isMobile ? 'min-h-[44px] flex items-center' : ''} // Better touch targets on mobile
  `;

  const shouldShowNavItem = (item) => {
    return item.roles.includes(currentUser?.role);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        ${sidebarOpen ? "w-64" : "w-16"} 
        ${isMobile && !sidebarOpen ? 'hidden' : ''}
        ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'}
        bg-white transition-all duration-300 ease-in-out
        ${isMobile ? '' : 'shadow-lg'}
        border-r border-slate-200
        ${isSmallMobile && sidebarOpen ? 'w-full' : ''} // Full width on very small screens
      `}>
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
                px-2 py-1 text-slate-600 hover:text-slate-800 transition-colors
                rounded-md hover:bg-slate-100
                ${isMobile ? 'min-h-[44px] min-w-[44px] flex items-center justify-center' : 'btn btn-outline'}
              `}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              ≡
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                if (!shouldShowNavItem(item)) return null;
                
                const IconComponent = item.icon;
                
                return (
                  <li key={item.path}>
                    <NavLink 
                      to={item.path}
                      className={({isActive}) => getNavLinkClasses(isActive)}
                      onClick={closeSidebarOnMobile}
                    >
                      {!sidebarOpen && (
                        <div className="flex justify-center">
                          <IconComponent className="w-5 h-5" />
                        </div>
                      )}
                      {sidebarOpen && (
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 flex-shrink-0" />
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
                    text-xs text-purple-600 hover:text-purple-800 hover:underline transition-colors
                    ${isMobile ? 'min-h-[44px] w-full text-left flex items-center' : ''}
                  `}
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={logout} 
                className={`
                  text-lg hover:text-purple-600 transition-colors
                  ${isMobile ? 'min-h-[44px] min-w-[44px] flex items-center justify-center' : ''}
                `}
                title="Logout"
                aria-label="Logout"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}