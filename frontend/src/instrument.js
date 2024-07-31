import * as Sentry from "@sentry/react";

import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

import { useEffect } from "react";

Sentry.init({
  dsn: "https://6fe214881fe5713445937c8f65357ee5@o4505458059116544.ingest.us.sentry.io/4507697059135488",
  integrations: [
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        }),
        Sentry.replayIntegration(),
      ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [/^https:\/\/bom-squad\.com\/api/],
  profilesSampleRate: 1.0, 
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0,
});
