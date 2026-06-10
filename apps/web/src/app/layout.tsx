import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Leaf } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maple Care — Compliance training for Atlantic-Canada LTC",
  description:
    "Inspector-ready compliance training for long-term-care operators in New Brunswick, Nova Scotia, PEI, and Newfoundland. Bilingual (EN/FR), PHIPAA-aware, hosted in ca-central-1.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
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
                <span className="text-lg">Maple Care</span>
              </Link>
              <div className="flex items-center gap-1 text-sm sm:gap-2">
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                  >
                    Book a pilot
                  </Link>
                </SignedOut>
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
                <span className="font-medium text-foreground">Maple Care</span>
                <span className="hidden sm:inline">
                  — Compliance training for Atlantic-Canada LTC
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
    </ClerkProvider>
  );
}
