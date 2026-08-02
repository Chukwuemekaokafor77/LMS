import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { SESSION_COOKIE } from "@/lib/session-constants";
import { getMe } from "@/lib/me";
import { SentryClient } from "@/components/sentry-client";
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

  // Surface the Admin section for site/org admins. Resolved here (not just in
  // /admin's own gate) so the section is discoverable from the header. Fails
  // soft: an API hiccup just omits the link rather than breaking the shell.
  // Also derives the document language from the viewer's locale (a11y: the
  // <html lang> must match the rendered content for screen readers).
  let isAdmin = false;
  let lang = "en";
  if (signedIn) {
    try {
      const me = await getMe();
      isAdmin =
        me?.staff?.orgPermission === "ORG_ADMIN" ||
        me?.staff?.orgPermission === "SITE_ADMIN";
      if (me?.user?.preferredLocale === "fr-CA") lang = "fr";
    } catch {
      isAdmin = false;
    }
  }
  const fr = lang === "fr";

  return (
    <html lang={lang}>
      <body className="flex min-h-screen flex-col antialiased">
        <SentryClient />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-medium focus:text-primary-foreground focus:shadow"
        >
          {fr ? "Passer au contenu principal" : "Skip to main content"}
        </a>
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav
            aria-label={fr ? "Navigation principale" : "Main navigation"}
            className="container flex h-16 items-center justify-between"
          >
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
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Admin
                    </Link>
                  )}
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

        <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>

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
