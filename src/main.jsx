import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppStoreProvider } from "./context/AppStore";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  </React.StrictMode>
);