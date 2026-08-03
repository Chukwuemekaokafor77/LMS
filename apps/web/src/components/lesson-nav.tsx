import Link from "next/link";
import { CheckCircle2, Lock, Circle, Award } from "lucide-react";
import type { ModuleDetail } from "@/lib/modules";
import { lessonHasContent, lessonOpenable } from "@/lib/lessons";

/**
 * Persistent lesson table-of-contents for the course reader. Server component:
 * it renders links + status so the learner always knows where they are and can
 * jump between lessons. Marked up as a labelled nav with aria-current on the
 * active lesson for screen-reader + keyboard users.
 */
export function LessonNav({
  slug,
  mod,
  currentLessonId,
  hasAssignment,
  quizUnlocked,
  quizHref,
  quizDone,
  fr,
}: {
  slug: string;
  mod: ModuleDetail;
  currentLessonId?: string;
  hasAssignment: boolean;
  quizUnlocked: boolean;
  quizHref: string | null;
  quizDone: boolean;
  fr: boolean;
}) {
  return (
    <nav
      aria-label={fr ? "Leçons du module" : "Lessons in this module"}
      className="rounded-2xl border border-border bg-background p-2 shadow-sm"
    >
      <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {fr ? mod.titleFr : mod.titleEn}
      </p>
      <ol className="space-y-0.5">
        {mod.lessons.map((l, i) => {
          const openable = lessonOpenable(l, hasAssignment);
          const completed = l.completedAt !== null;
          const current = l.id === currentLessonId;
          const label = fr ? l.titleFr : l.titleEn;
          const status = completed
            ? fr
              ? "Complétée. "
              : "Completed. "
            : !lessonHasContent(l)
              ? fr
                ? "Pas encore disponible. "
                : "Not yet available. "
              : current
                ? fr
                  ? "Leçon en cours. "
                  : "Current lesson. "
                : "";
          const inner = (
            <>
              <span className="sr-only">{status}</span>
              <span
                aria-hidden
                className="flex h-5 w-5 shrink-0 items-center justify-center"
              >
                {completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : !lessonHasContent(l) ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                ) : current ? (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate">
                <span className="mr-1 tabular-nums text-muted-foreground">
                  {i + 1}.
                </span>
                {label}
              </span>
            </>
          );
          const base =
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition";
          return (
            <li key={l.id}>
              {openable ? (
                <Link
                  href={`/training/${slug}/lesson/${l.id}`}
                  aria-current={current ? "page" : undefined}
                  className={`${base} ${
                    current
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {inner}
                </Link>
              ) : (
                <span className={`${base} cursor-default text-muted-foreground`}>
                  {inner}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {quizHref && (
        <>
          <div className="my-1 h-px bg-border" />
          {quizUnlocked ? (
            <Link
              href={quizHref}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <Award className="h-4 w-4 text-primary" />
              </span>
              {quizDone
                ? fr
                  ? "Attestation"
                  : "Certificate"
                : fr
                  ? "Quiz"
                  : "Quiz"}
            </Link>
          ) : (
            <span className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
              </span>
              {fr ? "Quiz verrouillé" : "Quiz locked"}
            </span>
          )}
        </>
      )}
    </nav>
  );
}
