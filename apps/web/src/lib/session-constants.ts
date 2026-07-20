/**
 * Shared constants for the ElderCare Academy session cookie. Kept free of any
 * server-only imports (`next/headers`) so the edge middleware can import it.
 */
export const SESSION_COOKIE = "academy_session";
