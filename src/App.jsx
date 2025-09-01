import { HashRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Customers from "./pages/Customers";
import Drivers from "./pages/Drivers";
import Fleet from "./pages/Fleet";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Outsource from "./pages/Outsource";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { AppStoreProvider, useAppStore } from "./context/AppStore";
import ManagementNav from "./components/ManagementNav";
import MobileFAB from "./components/MobileFAB";

function AuthenticatedShell() {
  const { currentUser, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);
  
  // Close sidebar on mobile when route changes  
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-50">
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
              className="btn btn-outline px-2 py-1 text-slate-600 hover:text-slate-800"
            >
              ≡
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              <li>
                <NavLink 
                  to="/" 
                  className={({isActive}) => `
                    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={closeSidebarOnMobile}
                >
                  <span className={sidebarOpen ? "" : "sr-only"}>Dashboard</span>
                  {!sidebarOpen && <span className="text-center w-full block">📊</span>}
                  {sidebarOpen && "Dashboard"}
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/schedule" 
                  className={({isActive}) => `
                    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={closeSidebarOnMobile}
                >
                  <span className={sidebarOpen ? "" : "sr-only"}>Schedule</span>
                  {!sidebarOpen && <span className="text-center w-full block">📅</span>}
                  {sidebarOpen && "Schedule"}
                </NavLink>
              </li>
              
              {/* Management Section - Grouped Navigation */}
              <ManagementNav currentUser={currentUser} sidebarOpen={sidebarOpen} onMobileClick={closeSidebarOnMobile} />
              
              <li>
                <NavLink 
                  to="/billing" 
                  className={({isActive}) => `
                    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={closeSidebarOnMobile}
                >
                  <span className={sidebarOpen ? "" : "sr-only"}>Billing</span>
                  {!sidebarOpen && <span className="text-center w-full block">💰</span>}
                  {sidebarOpen && "Billing"}
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/reports" 
                  className={({isActive}) => `
                    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={closeSidebarOnMobile}
                >
                  <span className={sidebarOpen ? "" : "sr-only"}>Reports</span>
                  {!sidebarOpen && <span className="text-center w-full block">📈</span>}
                  {sidebarOpen && "Reports"}
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/outsource" 
                  className={({isActive}) => `
                    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={closeSidebarOnMobile}
                >
                  <span className={sidebarOpen ? "" : "sr-only"}>Outsource</span>
                  {!sidebarOpen && <span className="text-center w-full block">🤝</span>}
                  {sidebarOpen && "Outsource"}
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/history" 
                  className={({isActive}) => `
                    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={closeSidebarOnMobile}
                >
                  <span className={sidebarOpen ? "" : "sr-only"}>History</span>
                  {!sidebarOpen && <span className="text-center w-full block">📜</span>}
                  {sidebarOpen && "History"}
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/notifications" 
                  className={({isActive}) => `
                    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={closeSidebarOnMobile}
                >
                  <span className={sidebarOpen ? "" : "sr-only"}>Notifications</span>
                  {!sidebarOpen && <span className="text-center w-full block">🔔</span>}
                  {sidebarOpen && "Notifications"}
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/settings" 
                  className={({isActive}) => `
                    block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={closeSidebarOnMobile}
                >
                  <span className={sidebarOpen ? "" : "sr-only"}>Settings</span>
                  {!sidebarOpen && <span className="text-center w-full block">⚙️</span>}
                  {sidebarOpen && "Settings"}
                </NavLink>
              </li>
            </ul>
          </nav>
          
          {/* User info */}
          <div className={`p-4 border-t border-slate-200 bg-slate-50 ${sidebarOpen ? '' : 'text-center'}`}>
            {sidebarOpen ? (
              <>
                <div className="text-xs text-slate-600 mb-1">
                  Logged in as <span className="font-semibold text-slate-800">{currentUser?.name}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">({currentUser?.role})</div>
                <button 
                  onClick={logout} 
                  className="text-xs text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={logout} 
                className="text-lg hover:text-purple-600 transition-colors" 
                title="Logout"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>
      
      <main className={`flex-1 overflow-y-auto bg-slate-50 ${isMobile ? 'w-full' : ''}`}>
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<RequireAuth><Schedule /></RequireAuth>} />
            <Route path="/customers" element={<RequireRole roles={["Admin","Dispatcher"]}><Customers /></RequireRole>} />
            <Route path="/drivers" element={<RequireRole roles={["Admin","Dispatcher"]}><Drivers /></RequireRole>} />
            <Route path="/fleet" element={<RequireRole roles={["Admin"]}><Fleet /></RequireRole>} />
            <Route path="/billing" element={<RequireRole roles={["Admin"]}><Billing /></RequireRole>} />
            <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
            <Route path="/outsource" element={<RequireRole roles={["Admin"]}><Outsource /></RequireRole>} />
            <Route path="/history" element={<RequireRole roles={["Admin"]}><History /></RequireRole>} />
            <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="/settings" element={<RequireRole roles={["Admin"]}><Settings /></RequireRole>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
      
      {/* Mobile FAB for quick actions */}
      <MobileFAB />
    </div>
  );
}

function AppShell() {
  const { currentUser } = useAppStore();
  
  // If not authenticated, show only login page
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  // If authenticated, show the full admin interface
  return <AuthenticatedShell />;
}

function RequireAuth({children}){
  const { currentUser } = useAppStore();
  if(!currentUser) return <Navigate to="/login" replace />;
  return children;
}
function RequireRole({children, roles}){
  const { currentUser } = useAppStore();
  if(!currentUser) return <Navigate to="/login" replace />;
  if(!roles.includes(currentUser.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App(){
  return (
    <AppStoreProvider>
      <Router>
        <AppShell />
      </Router>
    </AppStoreProvider>
  );
}