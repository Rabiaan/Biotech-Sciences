import { jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
createRoot(document.getElementById("root")).render(
  jsx(StrictMode, { children: jsx(AuthProvider, { children: jsx(App, {}) }) })
);
