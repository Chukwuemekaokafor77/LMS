import { redirect } from "next/navigation";
import { QuizRunner } from "@/components/quiz-runner";
import { apiFetch } from "@/lib/api";
import { getMe } from "@/lib/me";

type Assignment = {
  id: string;
  status: string;
  module: {
    slug: string;
    titleEn: string;
    titleFr: string;
    quiz: {
      id: string;
      passMark: number;
      questions: {
        id: string;
        promptEn: string;
        promptFr: string;
        type: "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
        choicesEn: string[];
        choicesFr: string[];
      }[];
    } | null;
  };
  certificate: { id: string } | null;
};

async function getAssignment(id: string): Promise<Assignment | null> {
  const res = await apiFetch(`/assignments/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string }>;
}) {
  const me = await getMe();
  if (!me?.staff) redirect("/sign-in");
  const { assignmentId } = await searchParams;
  if (!assignmentId) redirect("/dashboard");
  const a = await getAssignment(assignmentId);
  if (!a || !a.module.quiz) redirect("/dashboard");

  return (
    <main className="container py-12">
      <QuizRunner
        assignmentId={a.id}
        locale={me.user.preferredLocale}
        moduleTitleEn={a.module.titleEn}
        moduleTitleFr={a.module.titleFr}
        passMark={a.module.quiz.passMark}
        questions={a.module.quiz.questions}
        completed={a.status === "COMPLETED"}
        certificateId={a.certificate?.id ?? null}
      />
    </main>
  );
}
