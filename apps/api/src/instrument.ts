import * as Sentry from "@sentry/node";
import { sentryBeforeSend } from "./observability/sentry-redaction";

/**
 * Sentry error monitoring for the Academy API. Initialised only when SENTRY_DSN
 * is set, so tests / CI / local dev run with Sentry fully inert. Point the DSN
 * at the same Sentry org as ElderCare for one pane of glass.
 *
 * This module MUST be imported before AppModule (see main.ts) so the SDK can
 * auto-instrument http/express/prisma before those libraries are loaded.
 */
const dsn = process.env.SENTRY_DSN;
if (dsn) {
  const environment =
    process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";
  const tracesSampleRate = Number(
    process.env.SENTRY_TRACES_SAMPLE_RATE ??
      (environment === "production" ? "0.05" : "1.0"),
  );

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate,
    sendDefaultPii: false, // never send IP / headers / cookies by default
    beforeSend: sentryBeforeSend,
  });
}
