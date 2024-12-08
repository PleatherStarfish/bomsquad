import "./instrument";
import "./styles/styles.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Sentry from "@sentry/react";
import { HelmetProvider } from "react-helmet-async";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import { MathJaxContext } from "better-react-mathjax";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 3,
    },
    queries: {
      refetchInterval: 30 * 1000, // 30 seconds
      refetchIntervalInBackground: false,
      refetchOnMount: "always",
      refetchOnReconnect: "always",
      refetchOnWindowFocus: "always",
      retry: 3,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <BrowserRouter>
        <HelmetProvider>
          <MathJaxContext>
            <App />
          </MathJaxContext>
        </HelmetProvider>
      </BrowserRouter>
    </React.StrictMode>
  </QueryClientProvider>
);
