import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { SESSION_COOKIE } from "@/lib/session-constants";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElderCare Academy — Training for Atlantic-Canada home-care teams",
  description:
    "Inspector-ready compliance training for home-care agencies in New Brunswick, Nova Scotia, PEI, and Newfoundland. Bilingual (EN/FR), PHIPAA-aware, hosted in ca-central-1. A feature of ElderCare.",
};

const ELDERCARE = process.env.NEXT_PUBLIC_ELDERCARE_APP_URL ?? "/";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signedIn = (await cookies()).has(SESSION_COOKIE);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-sm">
                <Leaf className="h-[18px] w-[18px]" />
              </span>
              <span className="text-lg">ElderCare Academy</span>
            </Link>
            <div className="flex items-center gap-1 text-sm sm:gap-2">
              {signedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/sso/logout"
                    prefetch={false}
                    className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign out
                  </Link>
                </>
              ) : (
                <Link
                  href={ELDERCARE}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Open ElderCare
                </Link>
              )}
            </div>
          </nav>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-border/60">
          <div className="container flex flex-col gap-3 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-gradient text-white">
                <Leaf className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-foreground">
                ElderCare Academy
              </span>
              <span className="hidden sm:inline">
                — Compliance training for Atlantic-Canada home care
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>PHIPAA-aware</span>
              <span aria-hidden>·</span>
              <span>Hosted in ca-central-1</span>
              <span aria-hidden>·</span>
              <span>EN / FR</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
