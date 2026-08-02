import type { ErrorEvent, EventHint } from "@sentry/node";

/**
 * Strips secrets + PHI from Sentry events before they leave the process — the
 * TS counterpart of ElderCare's logging_redaction.sentry_before_send. The
 * Academy stores staff names/emails and training records in plaintext, so a
 * stack trace or echoed request/response body could otherwise leak PHI to
 * Sentry. Over-redaction is acceptable: a redacted operational field is far
 * cheaper than a leaked identity.
 */
const REDACTED = "[REDACTED]";

// Header names whose values are always secrets.
const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization",
]);

// Object keys (case-insensitive) whose values are secrets or PHI.
const SENSITIVE_KEYS = new Set(
  [
    // secrets / auth
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
    "signature",
    // PHI / PII (staff + client identities)
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

/** Recursively redact sensitive keys in an arbitrary structure. */
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
    if (req.headers && typeof req.headers === "object") {
      for (const key of Object.keys(req.headers)) {
        if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
          (req.headers as Record<string, string>)[key] = REDACTED;
        }
      }
    }
    if (req.cookies) req.cookies = REDACTED as unknown as typeof req.cookies;
    if (req.data !== undefined) req.data = scrub(req.data);
    if (typeof req.query_string === "string") {
      req.query_string = redactString(req.query_string);
    }
  }

  if (event.extra) event.extra = scrub(event.extra) as ErrorEvent["extra"];
  if (event.contexts) event.contexts = scrub(event.contexts) as ErrorEvent["contexts"];

  if (event.breadcrumbs) {
    for (const crumb of event.breadcrumbs) {
      if (crumb.data) crumb.data = scrub(crumb.data) as typeof crumb.data;
      if (typeof crumb.message === "string") {
        crumb.message = redactString(crumb.message);
      }
    }
  }

  return event;
}
