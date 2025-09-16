import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Customers from "./pages/Customers";
import Drivers from "./pages/Drivers";
import Fleet from "./pages/Fleet";
import Partners from "./pages/Partners";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import FinanceTracker from "./pages/FinanceTracker";
import Estimations from "./pages/Estimations";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import { AppStoreProvider, useAppStore } from "./context/AppStore";
import { FleetProvider } from "./context/FleetContext";
import Sidebar from "./components/Sidebar";
import MobileFAB from "./components/MobileFAB";
import { useResponsive } from "./hooks/useResponsive";
import ErrorBoundary from "./components/ErrorBoundary";

function AuthenticatedShell() {
  const { currentUser } = useAppStore();
  const { isMobile, isDesktop } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  
  // Handle responsive behavior for sidebar
  // Only auto-open on desktop initially, allow manual collapse
  useEffect(() => {
    // Only auto-open the first time when switching to desktop
    // This allows users to manually collapse on desktop
    if (isDesktop && sidebarOpen === false) {
      // Check if this is the first load or switching from mobile
      const hasManuallyCollapsed = localStorage.getItem('sidebarManuallyCollapsed') === 'true';
      if (!hasManuallyCollapsed) {
        setSidebarOpen(true);
      }
    }
    if (isMobile) {
      // Clear the manually collapsed flag when on mobile
      localStorage.removeItem('sidebarManuallyCollapsed');
    }
  }, [isDesktop, isMobile]);
  
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 ${isMobile ? 'w-full' : ''}`}>
        <div className={`${isMobile ? 'p-2' : 'p-4 md:p-6 lg:p-8'} max-w-full mx-auto`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<RequireAuth><Schedule /></RequireAuth>} />
            <Route path="/invoices" element={<RequireRole roles={["Admin","Dispatcher"]}><Billing /></RequireRole>} />
            <Route path="/customers" element={<RequireRole roles={["Admin","Dispatcher"]}><Customers /></RequireRole>} />
            <Route path="/drivers" element={<RequireRole roles={["Admin","Dispatcher"]}><Drivers /></RequireRole>} />
            <Route path="/fleet" element={<RequireRole roles={["Admin"]}><Fleet /></RequireRole>} />
            <Route path="/partners" element={<RequireRole roles={["Admin"]}><Partners /></RequireRole>} />
            <Route path="/finance" element={<RequireRole roles={["Admin"]}><Estimations /></RequireRole>} />
            <Route path="/reports" element={<RequireRole roles={["Admin","Dispatcher"]}><Reports /></RequireRole>} />
            <Route path="/history" element={<Navigate to="/reports" replace />} />
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
    <ErrorBoundary>
      <FleetProvider>
        <AppStoreProvider>
          <Router>
            <AppShell />
          </Router>
        </AppStoreProvider>
      </FleetProvider>
    </ErrorBoundary>
  );
}