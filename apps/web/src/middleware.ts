import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

const ELDERCARE = process.env.NEXT_PUBLIC_ELDERCARE_APP_URL;

// Signed-in-only areas. Everything else (landing, /sso, /api/session-token) is
// reachable while signed out — the Academy has no login screen; unauthenticated
// visits to a protected route bounce to ElderCare (or the landing page).
const PROTECTED = [/^\/dashboard/, /^\/admin/, /^\/training/];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!PROTECTED.some((re) => re.test(path))) return NextResponse.next();
  if (req.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const dest = ELDERCARE ?? new URL("/", req.url).toString();
  return NextResponse.redirect(dest);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
