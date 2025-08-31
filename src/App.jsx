import { HashRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useState } from "react";
import logoSvg from "./assets/logo.svg";
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

function Shell() {
  const { currentUser, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen">
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-lg transition-all p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={logoSvg} alt="logo" className="w-8 h-8 rounded" />
            {sidebarOpen && <span className="font-bold text-lg">Priority</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-outline px-2 py-1">≡</button>
        </div>
        <nav>
          <ul className="space-y-1">
            {[
              ["Dashboard", "/"],
              ["Schedule", "/schedule"],
              ["Customers", "/customers"],
              ["Drivers", "/drivers"],
              ["Fleet", "/fleet"],
              ["Billing", "/billing"],
              ["Reports", "/reports"],
              ["Outsource", "/outsource"],
              ["History", "/history"],
              ["Notifications", "/notifications"],
              ["Settings", "/settings"],
            ].map(([label, path]) => (
              <li key={path}>
                <NavLink to={path} className={({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?"bg-gray-200 font-semibold":""}`}>{label}</NavLink>
              </li>
            ))}
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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
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
        <Shell />
      </Router>
    </AppStoreProvider>
  );
}