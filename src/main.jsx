import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; // ✅ use HashRouter for GitHub Pages
import App from "./App";

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <App />
  </HashRouter>
);
