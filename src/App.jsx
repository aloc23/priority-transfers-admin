import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import supabase from "./utils/supabaseClient";
import Login from "./pages/Login";

// import all your existing pages
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Schedule from "./pages/Schedule";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Vehicles";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Estimations from "./pages/Estimations";
import Partners from "./pages/Partners";
import Settings from "./pages/Settings";

// import your shared layout (navbar/sidebar wrapper)
import Layout from "./components/Layout";

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

  if (session === undefined) return <div className="p-6">Loading…</div>;
  if (!session) return <Login />;

  // ✅ when logged in, render your full app with routing
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
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
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}
