"use client";

import { useCallback } from "react";

// Cached for the page lifetime — the session is one-per-browser and lasts 8h;
// a 401 from the API triggers a full redirect through /sso, which resets this.
let cachedToken: string | null = null;

async function fetchToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  const res = await fetch("/api/session-token", { cache: "no-store" });
  if (!res.ok) return null;
  const { token } = (await res.json()) as { token: string };
  cachedToken = token;
  return token;
}

/**
 * Client-side accessor for the Academy session bearer. Drop-in shape-match for
 * the retired Clerk `useAuth()` — call sites keep `const { getToken } = ...`.
 */
export function useSession() {
  const getToken = useCallback(fetchToken, []);
  return { getToken };
}
