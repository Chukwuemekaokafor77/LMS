import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  if (!me?.staff) redirect("/sign-in");

  const mod = await getModule(slug);
  if (!mod) notFound();
  const idx = mod.lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) notFound();
  const lesson = mod.lessons[idx];
  const next = mod.lessons[idx + 1] ?? null;

  const fr = me.user.preferredLocale === "fr-CA";

  return (
    <main className="container py-12">
      <Link
        href={`/training/${slug}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {fr ? mod.titleFr : mod.titleEn}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">
        {idx + 1}. {fr ? lesson.titleFr : lesson.titleEn}
      </h1>

      <div className="mt-6 max-w-4xl">
        <LessonPlayer
          lessonId={lesson.id}
          videoStatus={lesson.videoStatus}
          initiallyCompleted={lesson.completedAt !== null}
          fr={fr}
          nextHref={next ? `/training/${slug}/lesson/${next.id}` : null}
          moduleHref={`/training/${slug}`}
        />
      </div>
    </main>
  );
}
