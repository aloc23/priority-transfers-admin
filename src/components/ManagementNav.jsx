// Management Navigation Component for consolidated tabs
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const managementRoutes = [
  { path: '/customers', label: 'Customers', roles: ['Admin', 'Dispatcher'] },
  { path: '/drivers', label: 'Drivers', roles: ['Admin', 'Dispatcher'] },
  { path: '/fleet', label: 'Fleet', roles: ['Admin'] }
];

export default function ManagementNav({ currentUser, sidebarOpen }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  // Check if we're on any management route
  const isManagementActive = managementRoutes.some(route => 
    location.pathname === route.path
  );

  // Filter routes based on user permissions
  const allowedRoutes = managementRoutes.filter(route => 
    route.roles.includes(currentUser?.role)
  );

  if (allowedRoutes.length === 0) {
    return null;
  }

  return (
    <li>
      <div>
        {/* Main Management toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100 text-left ${
            isManagementActive ? 'bg-gray-200 font-semibold' : ''
          }`}
        >
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sidebarOpen && <span>Management</span>}
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
          <ul className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
            {allowedRoutes.map(route => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  className={({ isActive }) =>
                    `block px-3 py-1.5 text-sm rounded hover:bg-gray-100 ${
                      isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600'
                    }`
                  }
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