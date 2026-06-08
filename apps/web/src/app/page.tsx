import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container py-16">
      <header className="max-w-3xl">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Built for NB · NS · PE · NL — bilingue / bilingual
        </span>
        <h1 className="mt-4 text-5xl font-bold tracking-tight">
          Inspector-ready compliance training for Atlantic long-term care.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          IPAC, fire safety, abuse prevention, PHIPAA, falls, dementia care —
          mandatory training delivered, tracked, and exported in the format
          your inspector expects. Bilingual EN/FR, hosted in ca-central-1.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/sign-up"
            className="rounded bg-primary px-5 py-3 font-medium text-primary-foreground"
          >
            Book a pilot
          </Link>
          <Link href="/sign-in" className="rounded border px-5 py-3">
            Staff sign in
          </Link>
        </div>
      </header>

      <section className="mt-20 grid gap-8 md:grid-cols-3">
        <Feature
          title="Built around your inspector"
          body="Per-site, per-topic, per-date-range PDF and CSV exports formatted for NB Department of Social Development inspections."
        />
        <Feature
          title="Bilingual from day 1"
          body="Every module in English and French — required by NB's Official Languages Act and respected by francophone staff and residents."
        />
        <Feature
          title="PHIPAA-grade audit"
          body="Every record access logged, append-only audit ledger, retention scheduler. Resident and staff PHI never leaves Canada."
        />
        <Feature
          title="Bring your own content"
          body="Upload existing PowerPoints, PDFs, and videos. We handle delivery, attestation, and certificates."
        />
        <Feature
          title="Eight ready modules"
          body="IPAC, Fire Safety, WHMIS 2015, Resident Rights, Abuse & Reporting, Privacy (PHIPAA), Falls Prevention, Responsive Behaviours / Dementia."
        />
        <Feature
          title="Per-seat pricing"
          body="One subscription per home. Add staff via CSV roster import — no per-course fees."
        />
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-lg border p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </article>
  );
}
