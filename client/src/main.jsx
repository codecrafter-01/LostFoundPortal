import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ReportProvider from "./context/ReportContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReportProvider>
      <App />
    </ReportProvider>
  </StrictMode>
);