import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppStoreProvider } from "./context/AppStore";
import "./index.css";

console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL)
console.log("Supabase Key present?:", !!import.meta.env.VITE_SUPABASE_ANON_KEY)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  </React.StrictMode>
);