import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session-constants";

/** Server-side: the current Academy session token, or null if signed out. */
export async function getSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}
