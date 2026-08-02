import { notFound, redirect } from "next/navigation";
import { Leaf, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getMe } from "@/lib/me";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CertificateActions } from "@/components/certificate-actions";

type CertMeta = {
  id: string;
  issuedAt: string;
  expiresAt: string | null;
  sha256: string;
  learnerName: string;
  roleLabelEn: string;
  roleLabelFr: string;
  orgName: string;
  siteName: string | null;
  jurisdiction: string;
  moduleTitleEn: string;
  moduleTitleFr: string;
  moduleSlug: string;
  durationMin: number;
  scorePct: number | null;
  attestationHash: string | null;
};

async function getCert(id: string): Promise<CertMeta | null> {
  const res = await apiFetch(`/certificates/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();
  if (!me?.staff) redirect("/");
  const cert = await getCert(id);
  if (!cert) notFound();

  const fr = me.user.preferredLocale === "fr-CA";
  const locale = fr ? "fr-CA" : "en-CA";
  const moduleTitle = fr ? cert.moduleTitleFr : cert.moduleTitleEn;
  const roleLabel = fr ? cert.roleLabelFr : cert.roleLabelEn;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <main className="container py-10">
      <div className="print:hidden">
        <Breadcrumbs
          items={[
            { label: fr ? "Mes formations" : "My training", href: "/dashboard" },
            { label: fr ? "Attestation" : "Certificate" },
          ]}
        />
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        {/* The certificate itself — the only thing that prints. */}
        <article
          aria-label={fr ? "Attestation de réussite" : "Certificate of completion"}
          className="relative overflow-hidden rounded-2xl border border-border bg-background p-8 text-center shadow-sm sm:p-12 print:rounded-none print:border-2 print:shadow-none"
        >
          <div aria-hidden className="h-1.5 w-full bg-brand-gradient" />
          <div className="px-1 pt-8 sm:px-4">
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                ElderCare Academy
              </span>
            </div>

            <h1 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
              {fr ? "Attestation de réussite" : "Certificate of Completion"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {cert.orgName}
              {cert.siteName ? ` — ${cert.siteName}` : ""}
            </p>

            <p className="mt-8 text-sm uppercase tracking-wide text-muted-foreground">
              {fr ? "Présentée à" : "Presented to"}
            </p>
            <p className="mt-1 text-2xl font-semibold text-brand-gradient sm:text-3xl">
              {cert.learnerName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{roleLabel}</p>

            <p className="mx-auto mt-8 max-w-md text-sm text-muted-foreground">
              {fr
                ? "Pour avoir complété avec succès la formation"
                : "For successfully completing the training"}
            </p>
            <p className="mt-1 text-xl font-semibold">{moduleTitle}</p>

            <dl className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {fr ? "Date" : "Date"}
                </dt>
                <dd className="mt-0.5 font-medium">{fmt(cert.issuedAt)}</dd>
              </div>
              {cert.scorePct !== null && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {fr ? "Résultat" : "Score"}
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {cert.scorePct}%
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {fr ? "Durée" : "Duration"}
                </dt>
                <dd className="mt-0.5 font-medium">{cert.durationMin} min</dd>
              </div>
              {cert.expiresAt && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {fr ? "Valide jusqu'au" : "Valid until"}
                  </dt>
                  <dd className="mt-0.5 font-medium">{fmt(cert.expiresAt)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-10 border-t border-border pt-5">
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {fr
                  ? `Émise par ElderCare Academy · Compétence : ${cert.jurisdiction}`
                  : `Issued by ElderCare Academy · Jurisdiction: ${cert.jurisdiction}`}
              </p>
              {cert.attestationHash && (
                <p className="mt-2 break-all font-mono text-[10px] leading-relaxed text-muted-foreground/80">
                  {fr ? "Empreinte d'attestation (SHA-256) : " : "Attestation hash (SHA-256): "}
                  {cert.attestationHash}
                </p>
              )}
            </div>
          </div>
        </article>

        <div className="mt-8">
          <CertificateActions certificateId={cert.id} fr={fr} />
        </div>
      </div>
    </main>
  );
}
