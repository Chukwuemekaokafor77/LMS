import type { ErrorEvent, EventHint } from "@sentry/nextjs";

/**
 * Strips secrets + PHI from Sentry events before they leave the browser/SSR
 * process — the web counterpart of the API's sentry-redaction. The Academy
 * handles staff names/emails and session cookies, so over-redact rather than
 * risk leaking an identity to Sentry.
 */
const REDACTED = "[REDACTED]";

const SENSITIVE_KEYS = new Set(
  [
    "authorization",
    "cookie",
    "password",
    "token",
    "accesstoken",
    "refreshtoken",
    "sessiontoken",
    "academy_session",
    "secret",
    "apikey",
    "name",
    "fullname",
    "firstname",
    "lastname",
    "email",
    "phone",
    "phonenumber",
    "address",
    "postalcode",
    "dob",
    "dateofbirth",
    "healthcard",
    "notes",
    "carenotes",
    "externalauthid",
  ].map((k) => k.toLowerCase()),
);

const BEARER = /(bearer\s+)[A-Za-z0-9._-]+/gi;

function redactString(value: string): string {
  return value.replace(BEARER, `$1${REDACTED}`);
}

function scrub(data: unknown, depth = 0): unknown {
  if (depth > 8 || data == null) return data;
  if (typeof data === "string") return redactString(data);
  if (Array.isArray(data)) return data.map((v) => scrub(v, depth + 1));
  if (typeof data === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.has(k.toLowerCase())
        ? REDACTED
        : scrub(v, depth + 1);
    }
    return out;
  }
  return data;
}

export function sentryBeforeSend(
  event: ErrorEvent,
  _hint: EventHint,
): ErrorEvent {
  const req = event.request;
  if (req) {
    if (req.headers) req.headers = scrub(req.headers) as typeof req.headers;
    if (req.cookies) req.cookies = REDACTED as unknown as typeof req.cookies;
    if (req.data !== undefined) req.data = scrub(req.data);
    if (typeof req.query_string === "string") {
      req.query_string = redactString(req.query_string);
    }
  }
  if (event.extra) event.extra = scrub(event.extra) as ErrorEvent["extra"];
  if (event.contexts) {
    event.contexts = scrub(event.contexts) as ErrorEvent["contexts"];
  }
  if (event.breadcrumbs) {
    for (const crumb of event.breadcrumbs) {
      if (crumb.data) crumb.data = scrub(crumb.data) as typeof crumb.data;
    }
  }
  return event;
}
