import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TempoDevtools } from "tempo-devtools";
import { logEnvironmentInfo } from "./lib/debugHelper";

// Initialize Tempo Devtools
TempoDevtools.init();

// Log environment information for debugging
if (import.meta.env.DEV) {
  logEnvironmentInfo();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
