import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  if (!me?.staff) redirect("/sign-in");

  const [mod, assignment] = await Promise.all([
    getModule(slug),
    findAssignment(slug),
  ]);
  if (!mod) notFound();

  const fr = me.user.preferredLocale === "fr-CA";
  const title = fr ? mod.titleFr : mod.titleEn;
  const desc = fr ? mod.descriptionFr : mod.descriptionEn;
  const canWatch = (l: ModuleDetail["lessons"][number]) =>
    l.videoStatus === "READY" && (l.isPreview || assignment !== null);

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mod.durationMin} min
      </p>
      <p className="mt-4 max-w-3xl">{desc}</p>

      <ol className="mt-10 max-w-3xl space-y-2">
        {mod.lessons.map((l, i) => (
          <li
            key={l.id}
            className="flex items-center gap-3 rounded border p-3"
          >
            <span
              aria-hidden
              className={
                l.completedAt
                  ? "text-green-600"
                  : "text-muted-foreground"
              }
            >
              {l.completedAt ? "✓" : `${i + 1}.`}
            </span>
            {canWatch(l) ? (
              <Link
                href={`/training/${slug}/lesson/${l.id}`}
                className="font-medium hover:underline"
              >
                {fr ? l.titleFr : l.titleEn}
              </Link>
            ) : (
              <span>{fr ? l.titleFr : l.titleEn}</span>
            )}
            {l.isPreview && (
              <span className="rounded bg-primary/10 px-2 text-xs text-primary">
                preview
              </span>
            )}
            {l.videoStatus !== "READY" && (
              <span className="text-xs text-muted-foreground">
                {fr ? "(vidéo à venir)" : "(video coming soon)"}
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10">
        {assignment && mod.quiz ? (
          assignment.status === "COMPLETED" || mod.quizUnlocked ? (
            <Link
              href={`/training/${slug}/quiz?assignmentId=${assignment.id}`}
              className="rounded bg-primary px-5 py-3 font-medium text-primary-foreground"
            >
              {assignment.status === "COMPLETED"
                ? fr
                  ? "Voir l'attestation"
                  : "View certificate"
                : fr
                  ? "Commencer le quiz"
                  : "Start quiz"}
            </Link>
          ) : (
            <div>
              <span className="cursor-not-allowed rounded bg-muted px-5 py-3 font-medium text-muted-foreground">
                {fr ? "Quiz verrouillé" : "Quiz locked"}
              </span>
              <p className="mt-3 text-sm text-muted-foreground">
                {fr
                  ? "Terminez toutes les leçons pour déverrouiller le quiz."
                  : "Complete all lessons to unlock the quiz."}
              </p>
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            {fr
              ? "Cette formation ne vous a pas encore été attribuée."
              : "This module hasn't been assigned to you yet."}
          </p>
        )}
      </div>
    </main>
  );
}
