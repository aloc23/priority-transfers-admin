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
import StatusNotification from "./components/StatusNotification";

function AuthenticatedShell() {
  const { currentUser, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide sidebar on mobile when navigating
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="flex h-screen">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`${
        isMobile 
          ? `fixed top-0 left-0 h-full z-50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
          : sidebarOpen ? "w-64" : "w-16"
      } bg-white shadow-lg transition-all p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="./logo.svg" alt="logo" className="w-8 h-8 rounded" />
            {(sidebarOpen || !isMobile) && <span className="font-bold text-lg">Priority</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-outline px-2 py-1">≡</button>
        </div>
        <nav>
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/" 
                onClick={handleNavClick}
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/schedule" 
                onClick={handleNavClick}
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
              >
                Schedule
              </NavLink>
            </li>
            
            {/* Consolidated Management Section */}
            <ManagementNav currentUser={currentUser} sidebarOpen={sidebarOpen || !isMobile} />
            
            <li>
              <NavLink 
                to="/billing" 
                onClick={handleNavClick}
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
              >
                Billing
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/reports" 
                onClick={handleNavClick}
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
              >
                Reports
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/outsource" 
                onClick={handleNavClick}
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
              >
                Outsource
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/history" 
                onClick={handleNavClick}
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
              >
                History
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/notifications" 
                onClick={handleNavClick}
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
              >
                Notifications
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/settings" 
                onClick={handleNavClick}
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
              >
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="mt-6 text-xs text-gray-500">
          Logged in as <b>{currentUser?.name}</b> ({currentUser?.role})
          <button onClick={logout} className="block mt-2 text-indigo-600 hover:underline">Logout</button>
        </div>
      </aside>
      
      <main className={`flex-1 overflow-y-auto p-6 bg-gray-50 ${isMobile ? 'main-content' : ''}`}>
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
      </main>
      
      {/* Mobile FAB */}
      <MobileFAB />
      
      {/* Global Status Notifications */}
      <StatusNotification />
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