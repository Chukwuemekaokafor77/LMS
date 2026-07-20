import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Academy SSO entry (Seam 1). ElderCare's "Training" button lands the browser
 * here with a one-time token; we exchange it server-to-server for an Academy
 * session and set the httpOnly cookie, then drop the user on their dashboard.
 * The Academy has no login screen of its own — a missing/invalid token bounces
 * back to the marketing page.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  if (!token) {
    return NextResponse.redirect(new URL("/?sso_error=missing", req.url));
  }

  try {
    const res = await fetch(`${API}/auth/sso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`sso exchange ${res.status}`);
    const { sessionToken, expiresIn } = (await res.json()) as {
      sessionToken: string;
      expiresIn: number;
    };

    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?sso_error=1", req.url));
  }
}
