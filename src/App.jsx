import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import supabase from "./utils/supabaseClient";
import Login from "./pages/Login";

// Pages
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Fleet"; // Bookings inside Fleet
import Schedule from "./pages/Schedule";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Fleet"; // Fleet handles vehicles
import Customers from "./pages/Customers";
import Invoices from "./pages/Billing";
import Expenses from "./pages/FinanceTracker"; // contains expenses
import Income from "./pages/FinanceTracker"; // contains income
import Estimations from "./pages/Estimations";
import Partners from "./pages/Partners";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Outsource from "./pages/Outsource";
import History from "./pages/History";
import Signup from "./pages/Signup";

// Layout components
import Sidebar from "./components/Sidebar";
import MobileTopbar from "./components/MobileTopbar";

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let mounted = true;

    // initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setSession(session);
    });

    // keep session in sync
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSession(session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Loading state
  if (session === undefined) return <div className="p-6">Loading…</div>;

  // Not logged in → show Login page
  if (!session) return <Login />;

  // Logged in → render full app
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1">
          <MobileTopbar />
          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              {/* Default: redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/income" element={<Income />} />
              <Route path="/estimations" element={<Estimations />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/outsource" element={<Outsource />} />
              <Route path="/history" element={<History />} />
              <Route path="/signup" element={<Signup />} />
              {/* Catch-all: redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
