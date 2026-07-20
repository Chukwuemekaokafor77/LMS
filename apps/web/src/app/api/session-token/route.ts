import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session";

/**
 * Hands the Academy session token to client components for their API calls.
 * Same-origin only (the cookie is httpOnly, so JS can't read it directly);
 * returns nothing but the caller's own bearer. 401 when signed out.
 */
export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "no session" }, { status: 401 });
  }
  return NextResponse.json({ token });
}
