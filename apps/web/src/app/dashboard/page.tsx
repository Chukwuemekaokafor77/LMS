import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  AlertTriangle,
  BookOpen,
  Trophy,
  CheckCircle2,
  Award,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getMe } from "@/lib/me";

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
  const total = assignments.length;
  const pct = total === 0 ? 0 : Math.round((completed.length / total) * 100);
  const now = Date.now();

  const dateFmt = (d: string) =>
    new Date(d).toLocaleDateString(fr ? "fr-CA" : "en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <main className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-hero-glow"
      />
      <div className="container py-12">
        {/* Header + progress */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {fr ? "Mes formations" : "My training"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {fr
                ? "Vos formations attribuées, votre progression et vos attestations."
                : "Your assigned training, progress, and certificates."}
            </p>
          </div>
          {total > 0 && (
            <div className="w-full max-w-xs rounded-2xl border border-border bg-background/60 p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {fr ? "Progression" : "Overall progress"}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {completed.length}/{total}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={completed.length}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={fr ? "Progression globale" : "Overall progress"}
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {pct}% {fr ? "complété" : "complete"}
              </p>
            </div>
          )}
        </div>

        {/* Outstanding */}
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-[18px] w-[18px]" />
            </span>
            <h2 className="text-xl font-semibold">
              {fr ? "À compléter" : "Outstanding"}
            </h2>
            {outstanding.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {outstanding.length}
              </span>
            )}
          </div>

          {outstanding.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p>
                {fr
                  ? "Vous êtes à jour. Rien à faire pour l'instant."
                  : "You're up to date. Nothing due right now."}
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {outstanding.map((a) => {
                const overdue = new Date(a.dueAt).getTime() < now;
                const started = a.status === "IN_PROGRESS";
                return (
                  <li key={a.id}>
                    <Link
                      href={`/training/${a.module.slug}`}
                      className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold leading-snug">
                          {fr ? a.module.titleFr : a.module.titleEn}
                        </h3>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {started && (
                          <span className="rounded-full bg-secondary/10 px-2.5 py-1 font-medium text-cyan-700 dark:text-cyan-300">
                            {fr ? "En cours" : "In progress"}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${
                            overdue
                              ? "bg-red-500/10 text-red-600"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {overdue ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : (
                            <CalendarClock className="h-3 w-3" />
                          )}
                          {overdue
                            ? fr
                              ? "En retard"
                              : "Overdue"
                            : fr
                              ? "Échéance"
                              : "Due"}{" "}
                          {dateFmt(a.dueAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {a.module.durationMin} min
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Completed */}
        {completed.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <Trophy className="h-[18px] w-[18px]" />
              </span>
              <h2 className="text-xl font-semibold">
                {fr ? "Complétées" : "Completed"}
              </h2>
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {completed.length}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
              {completed.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium leading-tight">
                        {fr ? a.module.titleFr : a.module.titleEn}
                      </p>
                      {a.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          {fr ? "Complétée le " : "Completed "}
                          {dateFmt(a.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  {a.certificate && (
                    <Link
                      href={`/certificate/${a.certificate.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-primary/40 hover:bg-muted"
                    >
                      <Award className="h-3.5 w-3.5" />
                      {fr ? "Attestation" : "Certificate"}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
