import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Customers from "./pages/Customers";
import Drivers from "./pages/Drivers";
import Fleet from "./pages/Fleet";
import Partners from "./pages/Partners";
import UserManagement from "./pages/UserManagement";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FinanceTracker from "./pages/FinanceTracker";
import Estimations from "./pages/Estimations";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import { AppStoreProvider, useAppStore } from "./context/AppStore";
import { FleetProvider } from "./context/FleetContext";
import Sidebar from "./components/Sidebar";
import MobileFAB from "./components/MobileFAB";
import MobileTopbar from "./components/MobileTopbar";
import FloatingHamburger from "./components/FloatingHamburger";
import AuthErrorModal from "./components/AuthErrorModal";
import ErrorModal from "./components/ErrorModal";
import { useResponsive } from "./hooks/useResponsive";
import ErrorBoundary from "./components/ErrorBoundary";
import { isAdmin } from "./utils/adminUtils";

function AuthenticatedShell() {
  const { 
    currentUser, 
    authErrorModal, 
    errorModal,
    hideAuthErrorModal, 
    hideErrorModal,
    handleReLogin 
  } = useAppStore();
  const { isMobile, isDesktop } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed by default
  
  // Handle responsive behavior for sidebar
  useEffect(() => {
    if (isDesktop) {
      // On desktop, check if user manually collapsed it before
      const hasManuallyCollapsed = localStorage.getItem('sidebarManuallyCollapsed') === 'true';
      if (!hasManuallyCollapsed) {
        setSidebarOpen(true); // Auto-open on desktop unless manually collapsed
      }
    } else if (isMobile) {
      // On mobile, always start closed and clear any manual collapse flags
      setSidebarOpen(false);
      localStorage.removeItem('sidebarManuallyCollapsed');
    }
  }, [isDesktop, isMobile]);
  
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Floating Hamburger - only visible on mobile when sidebar is closed */}
      {isMobile && !sidebarOpen && (
        <FloatingHamburger onClick={() => setSidebarOpen(true)} />
      )}
      
      {/* Mobile Topbar - only shows when sidebar is open */}
      <MobileTopbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`flex-1 overflow-y-auto bg-slate-50 ${isMobile ? 'w-full' : ''}`}>
        <div className={`${isMobile ? 'p-2 pt-14' : 'p-4 md:p-6 lg:p-8'} max-w-full mx-auto`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<RequireAuth><Schedule /></RequireAuth>} />
            <Route path="/invoices" element={<RequireRole roles={["Admin","Dispatcher"]}><Billing /></RequireRole>} />
            <Route path="/customers" element={<RequireRole roles={["Admin","Dispatcher"]}><Customers /></RequireRole>} />
            <Route path="/drivers" element={<RequireRole roles={["Admin","Dispatcher"]}><Drivers /></RequireRole>} />
            <Route path="/fleet" element={<RequireRole roles={["Admin"]}><Fleet /></RequireRole>} />
            <Route path="/partners" element={<RequireRole roles={["Admin"]}><Partners /></RequireRole>} />
            <Route path="/user-management" element={<RequireRole roles={["Admin"]}><UserManagement /></RequireRole>} />
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
      
      {/* Global Authentication Error Modal */}
      <AuthErrorModal 
        isOpen={authErrorModal.isOpen}
        onClose={hideAuthErrorModal}
        onReLogin={handleReLogin}
        error={authErrorModal.error}
      />
      
      {/* Global General Error Modal */}
      <ErrorModal 
        isOpen={errorModal.isOpen}
        onClose={hideErrorModal}
        title={errorModal.title}
        error={errorModal.error}
      />
    </div>
  );
}

function AppShell() {
  const { currentUser, loading } = useAppStore();
  
  // Show loading screen while initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Priority Transfers...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, show only login and signup pages
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  // If authenticated, show the full admin interface
  return <AuthenticatedShell />;
}

function RequireAuth({children}){
  const { currentUser, loading } = useAppStore(); // ✅ Added loading
  
  if (loading) { // ✅ Show spinner while loading
    return <div>Checking authentication...</div>;
  }
  
  if(!currentUser) return <Navigate to="/login" replace />; // ✅ Only redirect after loading
  return children;
}

function RequireRole({children, roles}){
  const { currentUser } = useAppStore();
  if(!currentUser) return <Navigate to="/login" replace />;
  
  // Admin users have access to everything
  if(isAdmin(currentUser)) return children;
  
  // Non-admin users must have the required role
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
