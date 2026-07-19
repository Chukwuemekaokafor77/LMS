"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Client-side authed fetch against the API. JSON by default; throws with the
 * API's error message on non-2xx so callers can surface it directly.
 */
export function useApi() {
  const { getToken } = useAuth();
  return useCallback(
    async <T = unknown>(path: string, init: RequestInit = {}): Promise<T> => {
      const token = await getToken();
      const res = await fetch(`${API}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string | string[];
        };
        const msg = Array.isArray(body.message)
          ? body.message.join("; ")
          : body.message;
        throw new Error(msg ?? `Request failed (${res.status})`);
      }
      return res.json() as Promise<T>;
    },
    [getToken],
  );
}
