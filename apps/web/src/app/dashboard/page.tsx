import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getMe } from "@/lib/me";
import { CertificateDownload } from "@/components/certificate-download";

type Assignment = {
  id: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "REVOKED";
  dueAt: string;
  completedAt: string | null;
  module: {
    id: string;
    slug: string;
    titleEn: string;
    titleFr: string;
    durationMin: number;
  };
  certificate: { id: string; issuedAt: string; expiresAt: string | null } | null;
};

async function getAssignments(): Promise<Assignment[]> {
  const res = await apiFetch("/me/assignments");
  if (!res.ok) return [];
  return res.json();
}

export default async function DashboardPage() {
  const me = await getMe();
  if (!me) redirect("/"); // no Academy login — "/" routes to ElderCare
  if (!me.staff) redirect("/onboarding");

  const fr = me.user.preferredLocale === "fr-CA";
  const assignments = await getAssignments();
  const outstanding = assignments.filter((a) => a.status !== "COMPLETED");
  const completed = assignments.filter((a) => a.status === "COMPLETED");

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-bold">
        {fr ? "Mes formations" : "My training"}
      </h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">
          {fr ? "À compléter" : "Outstanding"}
        </h2>
        {outstanding.length === 0 ? (
          <p className="mt-2 text-muted-foreground">
            {fr
              ? "Vous êtes à jour. Rien à faire pour l'instant."
              : "You're up to date. Nothing due right now."}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {outstanding.map((a) => (
              <li key={a.id} className="rounded border p-4">
                <Link
                  href={`/training/${a.module.slug}`}
                  className="font-medium"
                >
                  {fr ? a.module.titleFr : a.module.titleEn}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fr ? "À compléter avant le " : "Due "}
                  {new Date(a.dueAt).toLocaleDateString(
                    fr ? "fr-CA" : "en-CA",
                    { year: "numeric", month: "short", day: "numeric" },
                  )}
                  {" · "}
                  {a.module.durationMin} min
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">
            {fr ? "Complétées" : "Completed"}
          </h2>
          <ul className="mt-4 space-y-2">
            {completed.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded border p-3 text-sm"
              >
                <span>{fr ? a.module.titleFr : a.module.titleEn}</span>
                {a.certificate && (
                  <CertificateDownload
                    certificateId={a.certificate.id}
                    fr={fr}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
