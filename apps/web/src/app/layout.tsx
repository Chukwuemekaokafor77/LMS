import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
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
        <body className="min-h-screen antialiased">
          <header className="border-b">
            <nav className="container flex items-center justify-between py-4">
              <Link href="/" className="font-semibold">
                Maple Care
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <SignedIn>
                  <Link href="/dashboard">Dashboard</Link>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <Link href="/sign-in">Sign in</Link>
                  <Link
                    href="/sign-up"
                    className="rounded bg-primary px-3 py-1.5 text-primary-foreground"
                  >
                    Book a pilot
                  </Link>
                </SignedOut>
              </div>
            </nav>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
