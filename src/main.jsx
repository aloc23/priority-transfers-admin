import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AppStoreProvider } from "./context/AppStore"; // 👈 add this

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  </HashRouter>
);
