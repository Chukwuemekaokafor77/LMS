import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

const ELDERCARE = process.env.NEXT_PUBLIC_ELDERCARE_APP_URL;

/** Clear the Academy session and return to ElderCare (or the landing page). */
export async function GET(req: NextRequest) {
  const dest = ELDERCARE ?? new URL("/", req.url).toString();
  const response = NextResponse.redirect(dest);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
