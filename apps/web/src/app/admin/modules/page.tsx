import Link from "next/link";
import { apiFetch } from "@/lib/api";

type AuthoredModule = {
  id: string;
  slug: string;
  titleEn: string;
  titleFr: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  durationMin: number;
  updatedAt: string;
  _count: { lessons: number };
  quiz: { id: string; passMark: number } | null;
};

async function getModules(): Promise<AuthoredModule[]> {
  const res = await apiFetch("/authoring/modules");
  if (!res.ok) return [];
  return res.json();
}

const STATUS_STYLES: Record<AuthoredModule["status"], string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-red-100 text-red-700",
};

export default async function ModulesPage() {
  const modules = await getModules();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modules</h1>
        <Link
          href="/admin/modules/new"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          New module
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Your organization&apos;s own training modules. Drafts are invisible to
        staff until published. Library modules are managed by ElderCare Academy.
      </p>

      {modules.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No modules yet — create your first one.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/modules/${m.id}`}
                className="flex items-center justify-between rounded border p-4 hover:bg-muted/50"
              >
                <div>
                  <span className="font-medium">{m.titleEn}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {m.titleFr}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m._count.lessons} lesson{m._count.lessons === 1 ? "" : "s"}
                    {" · "}
                    {m.quiz ? `quiz (pass ${m.quiz.passMark}%)` : "no quiz"}
                    {" · "}
                    {m.durationMin} min
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[m.status]}`}
                >
                  {m.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
