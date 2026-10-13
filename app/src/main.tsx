import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/sm-tokens.css";
import "./styles/app.css";
import "./styles/view-options.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
