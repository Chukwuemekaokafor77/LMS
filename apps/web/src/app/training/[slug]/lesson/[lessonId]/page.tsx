import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMe } from "@/lib/me";
import { getModule } from "@/lib/modules";
import { LessonPlayer } from "@/components/lesson-player";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const me = await getMe();
  if (!me?.staff) redirect("/");

  const mod = await getModule(slug);
  if (!mod) notFound();
  const idx = mod.lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) notFound();
  const lesson = mod.lessons[idx];
  const next = mod.lessons[idx + 1] ?? null;

  const fr = me.user.preferredLocale === "fr-CA";

  return (
    <main className="container py-10">
      <Link
        href={`/training/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {fr ? mod.titleFr : mod.titleEn}
      </Link>

      <div className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {fr ? "Leçon" : "Lesson"} {idx + 1} / {mod.lessons.length}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {fr ? lesson.titleFr : lesson.titleEn}
        </h1>
      </div>

      <div className="mt-8 max-w-3xl">
        <LessonPlayer
          lessonId={lesson.id}
          videoStatus={lesson.videoStatus}
          body={fr ? lesson.bodyFr : lesson.bodyEn}
          initiallyCompleted={lesson.completedAt !== null}
          fr={fr}
          nextHref={next ? `/training/${slug}/lesson/${next.id}` : null}
          moduleHref={`/training/${slug}`}
        />
      </div>
    </main>
  );
}
