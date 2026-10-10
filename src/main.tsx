import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./horizon.css";
import "./horizon-auth.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
