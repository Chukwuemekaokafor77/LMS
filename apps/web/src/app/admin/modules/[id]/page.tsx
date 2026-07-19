import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ModuleSettingsForm } from "@/components/authoring/module-settings-form";
import { LessonManager } from "@/components/authoring/lesson-manager";
import { QuizBuilder } from "@/components/authoring/quiz-builder";

export type AuthoredModuleDetail = {
  id: string;
  slug: string;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  durationMin: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  lessons: {
    id: string;
    titleEn: string;
    titleFr: string;
    position: number;
    isPreview: boolean;
    videoStatus: string;
  }[];
  quiz: {
    id: string;
    passMark: number;
    randomize: boolean;
    questions: {
      id: string;
      promptEn: string;
      promptFr: string;
      type: "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
      choicesEn: string[];
      choicesFr: string[];
      correctIdx: number[];
      explainEn: string | null;
      explainFr: string | null;
    }[];
  } | null;
};

export default async function ModuleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await apiFetch(`/authoring/modules/${id}`);
  if (res.status === 404 || res.status === 403) notFound();
  if (!res.ok) throw new Error(`API ${res.status}`);
  const mod = (await res.json()) as AuthoredModuleDetail;

  return (
    <div>
      <Link
        href="/admin/modules"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Modules
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{mod.titleEn}</h1>
      <p className="text-sm text-muted-foreground">
        {mod.slug} · {mod.status}
      </p>

      <section className="mt-8 max-w-2xl">
        <h2 className="text-lg font-semibold">Settings</h2>
        <div className="mt-3">
          <ModuleSettingsForm module={mod} />
        </div>
      </section>

      <section className="mt-10 max-w-2xl">
        <h2 className="text-lg font-semibold">Lessons</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Lessons with a READY video gate the quiz for learners. Upload sends
          the file straight to Mux; status updates when processing finishes.
        </p>
        <div className="mt-3">
          <LessonManager moduleId={mod.id} lessons={mod.lessons} />
        </div>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold">Quiz</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Saved as a whole — pass mark, then one card per question. Learners
          never receive the answer key.
        </p>
        <div className="mt-3">
          <QuizBuilder moduleId={mod.id} quiz={mod.quiz} />
        </div>
      </section>
    </div>
  );
}
