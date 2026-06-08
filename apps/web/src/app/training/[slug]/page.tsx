import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getMe } from "@/lib/me";

type Module = {
  id: string;
  slug: string;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  durationMin: number;
  lessons: {
    id: string;
    titleEn: string;
    titleFr: string;
    isPreview: boolean;
    videoStatus: string;
  }[];
  quiz: { id: string; passMark: number } | null;
};

async function getModule(slug: string): Promise<Module | null> {
  const res = await apiFetch(`/modules/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

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

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mod.durationMin} min
      </p>
      <p className="mt-4 max-w-3xl">{desc}</p>

      <ol className="mt-10 space-y-2">
        {mod.lessons.map((l, i) => (
          <li key={l.id} className="flex items-center gap-3">
            <span className="text-muted-foreground">{i + 1}.</span>
            <span>{fr ? l.titleFr : l.titleEn}</span>
            {l.isPreview && (
              <span className="rounded bg-primary/10 px-2 text-xs text-primary">
                preview
              </span>
            )}
            {l.videoStatus !== "READY" && (
              <span className="text-xs text-muted-foreground">
                ({l.videoStatus.toLowerCase()})
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10">
        {assignment && mod.quiz ? (
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
