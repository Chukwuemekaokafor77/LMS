"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApi } from "@/lib/client-api";

type QType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

type Question = {
  promptEn: string;
  promptFr: string;
  type: QType;
  choicesEn: string[];
  choicesFr: string[];
  correctIdx: number[];
  explainEn?: string | null;
  explainFr?: string | null;
};

type Quiz = {
  passMark: number;
  randomize: boolean;
  questions: Question[];
} | null;

const EMPTY_QUESTION: Question = {
  promptEn: "",
  promptFr: "",
  type: "SINGLE",
  choicesEn: ["", ""],
  choicesFr: ["", ""],
  correctIdx: [0],
};

const TRUE_FALSE_CHOICES = {
  choicesEn: ["True", "False"],
  choicesFr: ["Vrai", "Faux"],
};

export function QuizBuilder({
  moduleId,
  quiz,
}: {
  moduleId: string;
  quiz: Quiz;
}) {
  const api = useApi();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [passMark, setPassMark] = useState(quiz?.passMark ?? 80);
  const [questions, setQuestions] = useState<Question[]>(
    quiz?.questions.map((q) => ({ ...q })) ?? [],
  );

  function setQuestion(i: number, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
    setSaved(false);
  }

  function setType(i: number, type: QType) {
    const q = questions[i];
    if (type === "TRUE_FALSE") {
      setQuestion(i, { type, ...TRUE_FALSE_CHOICES, correctIdx: [0] });
    } else {
      const trimmed = type === "SINGLE" ? q.correctIdx.slice(0, 1) : q.correctIdx;
      setQuestion(i, { type, correctIdx: trimmed.length ? trimmed : [0] });
    }
  }

  function toggleCorrect(i: number, idx: number) {
    const q = questions[i];
    if (q.type === "MULTIPLE") {
      const set = new Set(q.correctIdx);
      if (set.has(idx)) set.delete(idx);
      else set.add(idx);
      setQuestion(i, { correctIdx: [...set].sort((a, b) => a - b) });
    } else {
      setQuestion(i, { correctIdx: [idx] });
    }
  }

  function setChoice(i: number, idx: number, lang: "En" | "Fr", value: string) {
    const q = questions[i];
    const key = `choices${lang}` as const;
    const next = q[key].slice();
    next[idx] = value;
    setQuestion(i, { [key]: next } as Partial<Question>);
  }

  function addChoice(i: number) {
    const q = questions[i];
    setQuestion(i, {
      choicesEn: [...q.choicesEn, ""],
      choicesFr: [...q.choicesFr, ""],
    });
  }

  function removeChoice(i: number, idx: number) {
    const q = questions[i];
    if (q.choicesEn.length <= 2) return;
    setQuestion(i, {
      choicesEn: q.choicesEn.filter((_, j) => j !== idx),
      choicesFr: q.choicesFr.filter((_, j) => j !== idx),
      correctIdx: q.correctIdx
        .filter((c) => c !== idx)
        .map((c) => (c > idx ? c - 1 : c)),
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await api(`/authoring/modules/${moduleId}/quiz`, {
        method: "PUT",
        body: JSON.stringify({
          passMark,
          randomize: quiz?.randomize ?? true,
          questions: questions.map((q) => ({
            promptEn: q.promptEn,
            promptFr: q.promptFr,
            type: q.type,
            choicesEn: q.choicesEn,
            choicesFr: q.choicesFr,
            correctIdx: q.correctIdx,
            explainEn: q.explainEn || undefined,
            explainFr: q.explainFr || undefined,
          })),
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-1 w-full rounded border px-3 py-2 text-sm";

  return (
    <div className="space-y-4">
      <label className="block w-44 text-sm font-medium">
        Pass mark (%)
        <input
          type="number"
          min={1}
          max={100}
          className={field}
          value={passMark}
          onChange={(e) => {
            setPassMark(Number(e.target.value));
            setSaved(false);
          }}
        />
      </label>

      {questions.map((q, i) => (
        <div key={i} className="rounded border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Question {i + 1}</span>
            <div className="flex items-center gap-2">
              <select
                className="rounded border px-2 py-1 text-xs"
                value={q.type}
                onChange={(e) => setType(i, e.target.value as QType)}
              >
                <option value="SINGLE">Single answer</option>
                <option value="MULTIPLE">Multiple answers</option>
                <option value="TRUE_FALSE">True / False</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  setQuestions((qs) => qs.filter((_, j) => j !== i))
                }
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-600"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <label className="block text-xs font-medium">
              Prompt (English)
              <input
                className={field}
                value={q.promptEn}
                onChange={(e) => setQuestion(i, { promptEn: e.target.value })}
              />
            </label>
            <label className="block text-xs font-medium">
              Question (français)
              <input
                className={field}
                value={q.promptFr}
                onChange={(e) => setQuestion(i, { promptFr: e.target.value })}
              />
            </label>
          </div>

          <div className="mt-3 space-y-2">
            {q.choicesEn.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type={q.type === "MULTIPLE" ? "checkbox" : "radio"}
                  name={`correct-${i}`}
                  checked={q.correctIdx.includes(idx)}
                  onChange={() => toggleCorrect(i, idx)}
                  title="Correct answer"
                />
                <input
                  className="flex-1 rounded border px-2 py-1 text-sm"
                  placeholder={`Choice ${idx + 1} (English)`}
                  value={c}
                  disabled={q.type === "TRUE_FALSE"}
                  onChange={(e) => setChoice(i, idx, "En", e.target.value)}
                />
                <input
                  className="flex-1 rounded border px-2 py-1 text-sm"
                  placeholder={`Choix ${idx + 1} (français)`}
                  value={q.choicesFr[idx] ?? ""}
                  disabled={q.type === "TRUE_FALSE"}
                  onChange={(e) => setChoice(i, idx, "Fr", e.target.value)}
                />
                {q.type !== "TRUE_FALSE" && (
                  <button
                    type="button"
                    onClick={() => removeChoice(i, idx)}
                    disabled={q.choicesEn.length <= 2}
                    className="text-xs text-muted-foreground disabled:opacity-30"
                    aria-label="Remove choice"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {q.type !== "TRUE_FALSE" && (
              <button
                type="button"
                onClick={() => addChoice(i)}
                className="rounded border px-2 py-1 text-xs"
              >
                Add choice
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setQuestions((qs) => [...qs, { ...EMPTY_QUESTION }])
          }
          className="rounded border px-4 py-2 text-sm"
        >
          Add question
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy || questions.length === 0}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save quiz"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved.</span>}
      </div>
      {questions.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No questions yet — add at least one to save a quiz.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
