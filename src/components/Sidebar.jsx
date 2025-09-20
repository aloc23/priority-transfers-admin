import { NavLink } from "react-router-dom";
import { useEffect } from "react";
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
  InvoiceIcon,
  HamburgerIcon,
  LogoutIcon,
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
    label: "Accounting",
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
    label: "Estimates",
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

const navSections = [
  {
    heading: 'Main',
    items: navigationItems.slice(0, 3) // Dashboard, Bookings & Calendar, Accounting
  },
  {
    heading: 'Management',
    items: navigationItems.slice(3, 5) // Reports, Estimates
  },
  {
    heading: 'Other',
    items: navigationItems.slice(5) // Notifications, Settings
  }
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { currentUser, logout } = useAppStore();
  const { isMobile, isSmallMobile } = useResponsive();
  const shouldShowNavItem = (item) => item.roles.includes(currentUser?.role);
  const closeSidebarOnMobile = () => { if (isMobile) setSidebarOpen(false); };

  // Handle sidebar toggle with localStorage for desktop
  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Store manually collapsed state for desktop
    if (!isMobile && !newState) {
      localStorage.setItem('sidebarManuallyCollapsed', 'true');
    } else if (!isMobile && newState) {
      localStorage.removeItem('sidebarManuallyCollapsed');
    }
  };

  // Add body overflow control for mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);
  const getNavLinkClasses = (isActive) =>
    `block px-4 py-3 rounded-xl transition-all duration-300 ease-in-out font-medium outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
    ${
      isActive
        ? `bg-sidebar-active text-white shadow-[0_0_16px_var(--tw-ring-color)] transform ${isMobile ? '' : 'scale-105'} border-l-4 border-accent ring-2 ring-accent ring-offset-2 ring-offset-slate-900`
        : "text-granite-200 hover:bg-sidebar-active-alt hover:text-white hover:shadow-[0_0_12px_var(--tw-ring-color)] hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-slate-900"
    }
    ${isMobile 
      ? 'min-h-[52px] flex items-center text-base mx-2' 
      : 'text-base'
    }
    ${!sidebarOpen && !isMobile ? "justify-center p-3" : ""}`;

  // Enhanced mobile navigation item rendering
  const renderNavItem = (item) => {
    if (!shouldShowNavItem(item)) return null;
    const IconComponent = item.icon;
    
    return (
      <li key={item.path} className={isMobile ? 'mb-1' : ''}>
        <NavLink 
          to={item.path}
          className={({isActive}) => getNavLinkClasses(isActive)}
          onClick={closeSidebarOnMobile}
          tabIndex={0}
          aria-label={item.label}
          title={!sidebarOpen ? item.label : undefined}
        >
          <div className={`flex items-center ${!sidebarOpen && !isMobile ? 'justify-center' : 'justify-start'}`}>
            <IconComponent 
              className={`
                ${isMobile ? 'w-6 h-6' : 'w-6 h-6'} 
                flex-shrink-0 
                ${!sidebarOpen && !isMobile ? '' : 'mr-3'}
              `} 
              aria-hidden="true" 
            />
            {sidebarOpen && (
              <span className={`text-left ${isMobile ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            )}
          </div>
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}
      <aside
        className={
          `${sidebarOpen ? "w-64" : "w-16"} ` +
          `${isMobile && !sidebarOpen ? 'hidden' : ''} ` +
          `${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} ` +
          `transition-all duration-300 ease-in-out ` +
          `${isMobile ? 'shadow-2xl' : 'shadow-lg'} ` +
          `border-r border-slate-600 ` +
          `${isSmallMobile && sidebarOpen ? 'w-full' : ''}`
          // Use sidebar background color
        }
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header - Enhanced for mobile with better spacing and visual hierarchy */}
          <div className={`
            flex items-center justify-between border-b border-slate-600 
            ${isMobile && sidebarOpen ? 'p-4 pt-6' : 'p-4'}
            ${isMobile ? 'min-h-[72px]' : ''}
          `}>
            <div className="flex items-center gap-3">
              <img 
                src="./logo.svg" 
                alt="logo" 
                className={`
                  rounded shadow-sm border border-slate-200 bg-white
                  ${isMobile ? 'w-10 h-10' : 'w-9 h-9'}
                `} 
              />
              {sidebarOpen && (
                <span className={`
                  font-bold text-white tracking-tight
                  ${isMobile ? 'text-xl' : 'text-xl'}
                `}>
                  Priority
                </span>
              )}
            </div>
            <button 
              onClick={handleSidebarToggle} 
              className={`
                px-3 py-2 text-granite-300 hover:text-white transition-all duration-200
                rounded-lg hover:bg-sidebar-active focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-sidebar-bg
                ${isMobile 
                  ? 'min-h-[48px] min-w-[48px] flex items-center justify-center hover:scale-105' 
                  : ''
                }
              `}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <HamburgerIcon className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
            </button>
          </div>
          {/* Navigation with section headings */}
          <nav className="flex-1 p-4 overflow-y-auto" aria-label="Main navigation">
            <ul className="space-y-2">
              {navSections.map(section => (
                <li key={section.heading} className="mb-2">
                  {sidebarOpen && <div className="text-xs font-semibold text-granite-400 uppercase px-2 mb-1 tracking-wider">{section.heading}</div>}
                  <ul className="space-y-1">
                    {section.items.map(item => {
                      if (!shouldShowNavItem(item)) return null;
                      const IconComponent = item.icon;
                      return (
                        <li key={item.path} className={isMobile ? 'mb-1' : ''}>
                          <NavLink 
                            to={item.path}
                            className={({isActive}) => getNavLinkClasses(isActive)}
                            onClick={closeSidebarOnMobile}
                            tabIndex={0}
                            aria-label={item.label}
                            title={!sidebarOpen ? item.label : undefined}
                          >
                            <div className={`flex items-center ${!sidebarOpen && !isMobile ? 'justify-center' : 'justify-start'}`}>
                              <IconComponent 
                                className={`
                                  ${isMobile ? 'w-6 h-6' : 'w-6 h-6'} 
                                  flex-shrink-0 
                                  ${!sidebarOpen && !isMobile ? '' : 'mr-3'}
                                `} 
                                aria-hidden="true" 
                              />
                              {sidebarOpen && (
                                <span className={`text-left ${isMobile ? 'font-medium' : ''}`}>
                                  {item.label}
                                </span>
                              )}
                            </div>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                  {sidebarOpen && <div className="border-b border-slate-600 my-2" />}
                </li>
              ))}
              {/* Management Section - Grouped Navigation */}
              <ManagementNav 
                currentUser={currentUser} 
                sidebarOpen={sidebarOpen} 
                onMobileClick={closeSidebarOnMobile} 
              />
            </ul>
          </nav>
          {/* User info with avatar - Enhanced for mobile */}
          <div className={
            `p-4 border-t border-slate-600 ` +
            `${sidebarOpen ? '' : 'text-center'} ` +
            `${isMobile ? 'min-h-[100px] pb-6' : 'min-h-[80px]'}`
          } style={{ backgroundColor: 'var(--granite-800)' }}>
            {sidebarOpen ? (
              <>
                <div className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-2'}`}>
                  <div className={`
                    ${isMobile ? 'w-10 h-10' : 'w-8 h-8'} 
                    rounded-full bg-accent/20 flex items-center justify-center 
                    text-accent font-bold border border-accent/30
                    ${isMobile ? 'text-lg' : 'text-base'}
                  `}>
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-granite-300 ${isMobile ? 'text-sm' : 'text-xs'} leading-tight`}>
                      Logged in as
                    </div>
                    <div className={`font-semibold text-white ${isMobile ? 'text-base' : 'text-xs'} leading-tight truncate`}>
                      {currentUser?.email || currentUser?.name}
                    </div>
                    <div className={`text-granite-400 ${isMobile ? 'text-sm' : 'text-xs'} leading-tight`}>
                      ({currentUser?.role})
                    </div>
                  </div>
                </div>
                <button 
                  onClick={logout} 
                  className={`
                    bg-accent/10 hover:bg-accent/20 text-accent hover:text-white 
                    rounded-lg transition-all duration-200 
                    focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-granite-800
                    border border-accent/20 hover:border-accent/40
                    flex items-center gap-2 font-medium
                    ${isMobile 
                      ? 'min-h-[48px] w-full px-4 py-3 text-sm justify-center' 
                      : 'px-3 py-2 text-xs w-full justify-center'
                    }
                  `}
                  aria-label="Logout"
                >
                  <LogoutIcon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button 
                onClick={logout} 
                className={
                  `hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 text-granite-300 ` +
                  `${isMobile ? 'min-h-[48px] min-w-[48px] flex items-center justify-center' : ''}`
                }
                title="Logout"
                aria-label="Logout"
              >
                <LogoutIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
