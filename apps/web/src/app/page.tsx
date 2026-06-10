import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Languages,
  ShieldCheck,
  Upload,
  Layers,
  Users,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow"
        />
        <div className="container py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Built for NB · NS · PE · NL — bilingue / bilingual
            </span>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Inspector-ready compliance training for{" "}
              <span className="text-brand-gradient">Atlantic long-term care</span>.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              IPAC, fire safety, abuse prevention, PHIPAA, falls, dementia care —
              mandatory training delivered, tracked, and exported in the format
              your inspector expects. Bilingual EN/FR, hosted in ca-central-1.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Book a pilot
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-medium transition-colors hover:bg-muted"
              >
                Staff sign in
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Trust icon={ShieldCheck} label="PHIPAA-grade audit" />
              <Trust icon={MapPin} label="Hosted in ca-central-1" />
              <Trust icon={Languages} label="EN / FR from day 1" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything an inspection asks for
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for the realities of Atlantic-Canada long-term care — not a
            generic LMS bolted onto healthcare.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={FileText}
            title="Built around your inspector"
            body="Per-site, per-topic, per-date-range PDF and CSV exports formatted for NB Department of Social Development inspections."
          />
          <Feature
            icon={Languages}
            title="Bilingual from day 1"
            body="Every module in English and French — required by NB's Official Languages Act and respected by francophone staff and residents."
          />
          <Feature
            icon={ShieldCheck}
            title="PHIPAA-grade audit"
            body="Every record access logged, append-only audit ledger, retention scheduler. Resident and staff PHI never leaves Canada."
          />
          <Feature
            icon={Upload}
            title="Bring your own content"
            body="Upload existing PowerPoints, PDFs, and videos. We handle delivery, attestation, and certificates."
          />
          <Feature
            icon={Layers}
            title="Eight ready modules"
            body="IPAC, Fire Safety, WHMIS 2015, Resident Rights, Abuse & Reporting, Privacy (PHIPAA), Falls Prevention, Responsive Behaviours / Dementia."
          />
          <Feature
            icon={Users}
            title="Per-seat pricing"
            body="One subscription per home. Add staff via CSV roster import — no per-course fees."
          />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/40 px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-cta-glow"
          />
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to be inspection-ready?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Book a pilot for your home and we&apos;ll have your staff training and
            audit trail live in days — bilingual, in-Canada, inspector-formatted.
          </p>
          <div className="mt-7 flex justify-center">
            <Link
              href="/sign-up"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Book a pilot
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Trust({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </span>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <article className="group rounded-xl border border-border bg-background p-6 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}
