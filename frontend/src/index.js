import React from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from "react-dom/client";
import App from "./App";
import './styles/styles.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </QueryClientProvider>
);
