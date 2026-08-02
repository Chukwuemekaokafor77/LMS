"use client";

import * as Sentry from "@sentry/nextjs";
import { sentryBeforeSend } from "@/lib/sentry-redaction";

/**
 * Client-side Sentry. Initialised at module load (once) when
 * NEXT_PUBLIC_SENTRY_DSN is set — inert otherwise. Rendered near the top of the
 * root layout. Renders nothing.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn && typeof window !== "undefined") {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",
    tracesSampleRate: 0.05,
    sendDefaultPii: false,
    beforeSend: sentryBeforeSend,
  });
}

export function SentryClient(): null {
  return null;
}
