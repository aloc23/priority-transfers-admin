import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppStoreProvider } from "./context/AppStore";
import "./index.css";

// Enhanced startup logging for Supabase connection verification
console.log("🚀 Priority Transfers Admin - Starting Application");
console.log("================================================");
console.log("📡 Supabase Configuration:");
console.log(`   URL: ${import.meta.env.VITE_SUPABASE_URL || 'Missing'}`);
console.log(`   Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Present' : '✗ Missing'}`);
console.log("📋 Connection verification will run during app initialization...\n");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  </React.StrictMode>
);