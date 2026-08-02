import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ListChecks,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileText,
  Award,
  PlayCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getMe } from "@/lib/me";
import { getModule, type ModuleDetail } from "@/lib/modules";

async function findAssignment(slug: string) {
  const res = await apiFetch("/me/assignments");
  if (!res.ok) return null;
  const list = (await res.json()) as {
    id: string;
    module: { slug: string };
    status: string;
  }[];
  return list.find((a) => a.module.slug === slug) ?? null;
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const me = await getMe();
  if (!me?.staff) redirect("/");

  const [mod, assignment] = await Promise.all([
    getModule(slug),
    findAssignment(slug),
  ]);
  if (!mod) notFound();

  const fr = me.user.preferredLocale === "fr-CA";
  const title = fr ? mod.titleFr : mod.titleEn;
  const desc = fr ? mod.descriptionFr : mod.descriptionEn;
  // A lesson can be opened once it has consumable content — a READY video or a
  // readable body — and the learner is entitled to it (preview, or assigned).
  const hasContent = (l: ModuleDetail["lessons"][number]) =>
    l.videoStatus === "READY" || l.bodyEn !== null;
  const canOpen = (l: ModuleDetail["lessons"][number]) =>
    hasContent(l) && (l.isPreview || assignment !== null);

  const gating = mod.lessons.filter(hasContent);
  const done = gating.filter((l) => l.completedAt !== null).length;
  const pct = gating.length === 0 ? 0 : Math.round((done / gating.length) * 100);

  return (
    <main className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-hero-glow"
      />
      <div className="container py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {fr ? "Mes formations" : "My training"}
        </Link>

        {/* Header card */}
        <div className="mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              {mod.durationMin} min
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
              <ListChecks className="h-3 w-3" />
              {mod.lessons.length} {fr ? "leçons" : "lessons"}
            </span>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            {desc}
          </p>

          {assignment && gating.length > 0 && (
            <div className="mt-6 max-w-md">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{fr ? "Progression des leçons" : "Lesson progress"}</span>
                <span className="tabular-nums">
                  {done}/{gating.length}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Lessons */}
        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {fr ? "Leçons" : "Lessons"}
        </h2>
        <ol className="mt-4 space-y-2">
          {mod.lessons.map((l, i) => {
            const openable = canOpen(l);
            const completedLesson = l.completedAt !== null;
            const rowClass = `group flex items-center gap-4 rounded-xl border border-border p-4 transition ${
              openable
                ? "bg-background hover:border-primary/30 hover:shadow-sm"
                : "bg-muted/30"
            }`;
            const inner = (
              <>
                <span
                    aria-hidden
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      completedLesson
                        ? "bg-green-500/15 text-green-600"
                        : openable
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {completedLesson ? (
                      <CheckCircle2 className="h-[18px] w-[18px]" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium leading-snug ${
                        openable ? "" : "text-muted-foreground"
                      }`}
                    >
                      {fr ? l.titleFr : l.titleEn}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {l.isPreview && (
                        <span className="rounded bg-secondary/10 px-1.5 py-0.5 text-[11px] font-medium text-secondary">
                          {fr ? "aperçu" : "preview"}
                        </span>
                      )}
                      {hasContent(l) && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          {l.videoStatus === "READY" ? (
                            <>
                              <PlayCircle className="h-3 w-3" />
                              {fr ? "vidéo" : "video"}
                            </>
                          ) : (
                            <>
                              <FileText className="h-3 w-3" />
                              {fr ? "lecture" : "reading"}
                            </>
                          )}
                        </span>
                      )}
                      {!hasContent(l) && (
                        <span className="text-[11px] text-muted-foreground">
                          {fr ? "bientôt disponible" : "coming soon"}
                        </span>
                      )}
                    </div>
                  </div>
                {openable && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                )}
              </>
            );
            return (
              <li key={l.id}>
                {openable ? (
                  <Link
                    href={`/training/${slug}/lesson/${l.id}`}
                    className={rowClass}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className={rowClass}>{inner}</div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Quiz CTA */}
        <div className="mt-8">
          {assignment && mod.quiz ? (
            assignment.status === "COMPLETED" || mod.quizUnlocked ? (
              <div className="flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
                    <Award className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">
                      {assignment.status === "COMPLETED"
                        ? fr
                          ? "Formation complétée"
                          : "Training complete"
                        : fr
                          ? "Prêt pour le quiz"
                          : "Ready for the quiz"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.status === "COMPLETED"
                        ? fr
                          ? "Téléchargez votre attestation."
                          : "Download your certificate."
                        : fr
                          ? `Note de passage : ${mod.quiz.passMark}%.`
                          : `Pass mark: ${mod.quiz.passMark}%.`}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/training/${slug}/quiz?assignmentId=${assignment.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  {assignment.status === "COMPLETED"
                    ? fr
                      ? "Voir l'attestation"
                      : "View certificate"
                    : fr
                      ? "Commencer le quiz"
                      : "Start quiz"}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-muted-foreground">
                    {fr ? "Quiz verrouillé" : "Quiz locked"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {fr
                      ? "Terminez toutes les leçons pour déverrouiller le quiz."
                      : "Complete all lessons to unlock the quiz."}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              {fr
                ? "Cette formation ne vous a pas encore été attribuée."
                : "This module hasn't been assigned to you yet."}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
