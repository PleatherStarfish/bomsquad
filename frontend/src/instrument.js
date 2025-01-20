import {init} from "@sentry/react";

init({
  dsn: "https://6fe214881fe5713445937c8f65357ee5@o4505458059116544.ingest.us.sentry.io/4507697059135488",
  profilesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1, 
  tracePropagationTargets: [/^https:\/\/bom-squad\.com\/api/], 
  tracesSampleRate: 1.0,
});