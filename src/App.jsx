import { HashRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useState } from "react";
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
  
  // Close sidebar on mobile when route changes  
  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="flex h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-lg transition-all p-4 relative z-30 ${
        window.innerWidth <= 768 && !sidebarOpen ? 'hidden' : ''
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="./logo.svg" alt="logo" className="w-8 h-8 rounded" />
            {sidebarOpen && <span className="font-bold text-lg">Priority</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-outline px-2 py-1">≡</button>
        </div>
        <nav>
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/" 
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
                onClick={closeSidebarOnMobile}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/schedule" 
                className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}
                onClick={closeSidebarOnMobile}
              >
                Schedule
              </NavLink>
            </li>
            
            {/* Management Section - Grouped Navigation */}
            <ManagementNav currentUser={currentUser} sidebarOpen={sidebarOpen} onMobileClick={closeSidebarOnMobile} />
            
            <li>
              <NavLink to="/billing" className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}>
                Billing
              </NavLink>
            </li>
            <li>
              <NavLink to="/reports" className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}>
                Reports
              </NavLink>
            </li>
            <li>
              <NavLink to="/outsource" className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}>
                Outsource
              </NavLink>
            </li>
            <li>
              <NavLink to="/history" className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}>
                History
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}>
                Notifications
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}>
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
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
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