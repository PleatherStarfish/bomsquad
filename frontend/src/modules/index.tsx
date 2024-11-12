import "../instrument";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Sentry from "@sentry/react";

import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";

// Locate the root element
const rootElement = document.getElementById("modules-root") as HTMLElement;

// Create the React 18 root using createRoot
const root = ReactDOM.createRoot(rootElement);

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);