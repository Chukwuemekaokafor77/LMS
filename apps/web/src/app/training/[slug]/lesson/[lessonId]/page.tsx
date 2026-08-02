import { notFound, redirect } from "next/navigation";
import { ListChecks } from "lucide-react";
import { getMe } from "@/lib/me";
import { getModule } from "@/lib/modules";
import { findAssignment } from "@/lib/lessons";
import { LessonPlayer } from "@/components/lesson-player";
import { LessonNav } from "@/components/lesson-nav";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const me = await getMe();
  if (!me?.staff) redirect("/");

  const [mod, assignment] = await Promise.all([
    getModule(slug),
    findAssignment(slug),
  ]);
  if (!mod) notFound();
  const idx = mod.lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) notFound();
  const lesson = mod.lessons[idx];
  const next = mod.lessons[idx + 1] ?? null;

  const fr = me.user.preferredLocale === "fr-CA";
  const moduleTitle = fr ? mod.titleFr : mod.titleEn;
  const lessonTitle = fr ? lesson.titleFr : lesson.titleEn;

  const completed = assignment?.status === "COMPLETED";
  const quizHref =
    assignment && mod.quiz
      ? `/training/${slug}/quiz?assignmentId=${assignment.id}`
      : null;

  const nav = (
    <LessonNav
      slug={slug}
      mod={mod}
      currentLessonId={lesson.id}
      hasAssignment={assignment !== null}
      quizUnlocked={mod.quizUnlocked || completed}
      quizHref={quizHref}
      quizDone={completed}
      fr={fr}
    />
  );

  return (
    <main className="container py-8">
      <Breadcrumbs
        items={[
          { label: fr ? "Mes formations" : "My training", href: "/dashboard" },
          { label: moduleTitle, href: `/training/${slug}` },
          { label: lessonTitle },
        ]}
      />

      {/* Mobile: collapsible lesson list. Desktop: sticky sidebar. */}
      <details className="mt-6 lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium">
          <ListChecks className="h-4 w-4 text-primary" />
          {fr ? "Leçons du module" : "Lessons in this module"}
        </summary>
        <div className="mt-2">{nav}</div>
      </details>

      <div className="mt-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{nav}</div>
        </aside>

        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {fr ? "Leçon" : "Lesson"} {idx + 1} / {mod.lessons.length}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {lessonTitle}
          </h1>

          <div className="mt-8">
            <LessonPlayer
              lessonId={lesson.id}
              videoStatus={lesson.videoStatus}
              body={fr ? lesson.bodyFr : lesson.bodyEn}
              initiallyCompleted={lesson.completedAt !== null}
              fr={fr}
              nextHref={next ? `/training/${slug}/lesson/${next.id}` : null}
              nextLabel={next ? (fr ? next.titleFr : next.titleEn) : null}
              moduleHref={`/training/${slug}`}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
