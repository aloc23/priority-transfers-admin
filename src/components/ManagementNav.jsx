// Management Navigation Component for consolidated tabs
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CustomerIcon } from './Icons';
import { useResponsive } from '../hooks/useResponsive';
import { isAdmin } from '../utils/adminUtils';

const managementRoutes = [
  { path: '/customers', label: 'Customers', roles: ['Admin', 'Dispatcher'] },
  { path: '/drivers', label: 'Drivers', roles: ['Admin', 'Dispatcher'] },
  { path: '/fleet', label: 'Fleet', roles: ['Admin'] },
  { path: '/partners', label: 'Partners', roles: ['Admin'] },
  { path: '/user-management', label: 'User Management', roles: ['Admin'] }
];

export default function ManagementNav({ currentUser, sidebarOpen, onMobileClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { isMobile } = useResponsive();

  // Check if we're on any management route
  const isManagementActive = managementRoutes.some(route => 
    location.pathname === route.path
  );

  // Filter routes based on user permissions
  // Admin users can see all management routes
  const allowedRoutes = managementRoutes.filter(route => 
    isAdmin(currentUser) || route.roles.includes(currentUser?.role)
  );

  if (allowedRoutes.length === 0) {
    return null;
  }

  const handleLinkClick = () => {
    if (onMobileClick) {
      onMobileClick();
    }
  };

  return (
    <li>
      <div>
        {/* Main Management toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-sidebar-active-alt text-left transition-all duration-200 text-sm font-medium ${
            isManagementActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-granite-200 hover:text-white'
          } ${isMobile ? 'min-h-[44px]' : ''}`}
          aria-expanded={isExpanded}
          aria-label={sidebarOpen ? "Management menu" : "Management"}
        >
          <span className="flex items-center gap-2">
            {!sidebarOpen ? (
              <div className="flex justify-center w-full">
                <CustomerIcon className="w-5 h-5" />
              </div>
            ) : (
              <>
                <CustomerIcon className="w-5 h-5 flex-shrink-0" />
                <span>Management</span>
              </>
            )}
          </span>
          {sidebarOpen && (
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Sub-navigation */}
        {sidebarOpen && (isExpanded || isManagementActive) && (
          <ul className="ml-4 mt-1 space-y-1 border-l border-slate-500 pl-3">
            {allowedRoutes.map(route => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-sm rounded-lg hover:bg-sidebar-active-alt transition-all duration-200 ${
                      isActive ? 'bg-sidebar-active text-white font-medium' : 'text-granite-300 hover:text-white'
                    } ${isMobile ? 'min-h-[44px] flex items-center' : ''}`
                  }
                  onClick={handleLinkClick}
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}