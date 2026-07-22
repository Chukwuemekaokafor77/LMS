import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

// Server-side exchange: prefer the runtime API_BASE_URL (a plain server env,
// always current) over the build-time-inlined NEXT_PUBLIC_API_URL.
const API =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

/**
 * Build absolute redirects from the *public* host. Behind DO's proxy, req.url's
 * host is the container's internal 0.0.0.0:3000, so redirects must use the
 * forwarded host or they point at 0.0.0.0.
 */
function publicUrl(path: string, req: NextRequest): URL {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return new URL(path, host ? `${proto}://${host}` : req.nextUrl.origin);
}

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
    return NextResponse.redirect(publicUrl("/?sso_error=missing", req));
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

    const response = NextResponse.redirect(publicUrl("/dashboard", req));
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });
    return response;
  } catch {
    return NextResponse.redirect(publicUrl("/?sso_error=1", req));
  }
}
