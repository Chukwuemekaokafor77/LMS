import * as Sentry from "@sentry/nextjs";
import { sentryBeforeSend } from "@/lib/sentry-redaction";

/**
 * Server-side Sentry for the Academy web app (SSR + route handlers). Next.js
 * calls register() once at startup and routes server request errors through
 * onRequestError. Initialised only when SENTRY_DSN is set — inert otherwise.
 *
 * Deliberately does NOT use withSentryConfig (no build-time webpack wrapper /
 * source-map upload) to keep the production build unchanged; errors are still
 * captured. Source-map upload can be added later with SENTRY_AUTH_TOKEN.
 */
export function register(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  const environment =
    process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: Number(
      process.env.SENTRY_TRACES_SAMPLE_RATE ??
        (environment === "production" ? "0.05" : "1.0"),
    ),
    sendDefaultPii: false,
    beforeSend: sentryBeforeSend,
  });
}

export const onRequestError = Sentry.captureRequestError;
