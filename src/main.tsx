import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./orbit.css";
import "./orbit-approved-tokens.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
