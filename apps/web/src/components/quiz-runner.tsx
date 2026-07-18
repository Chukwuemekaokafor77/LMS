"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Q = {
  id: string;
  promptEn: string;
  promptFr: string;
  type: "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
  choicesEn: string[];
  choicesFr: string[];
};

export function QuizRunner({
  assignmentId,
  locale,
  moduleTitleEn,
  moduleTitleFr,
  passMark,
  questions,
  completed,
  certificateId,
  attemptsUsed,
  maxAttempts,
}: {
  assignmentId: string;
  locale: string;
  moduleTitleEn: string;
  moduleTitleFr: string;
  passMark: number;
  questions: Q[];
  completed: boolean;
  certificateId: string | null;
  attemptsUsed: number;
  maxAttempts: number;
}) {
  const { getToken } = useAuth();
  const fr = locale === "fr-CA";
  const title = fr ? moduleTitleFr : moduleTitleEn;

  const [used, setUsed] = useState(attemptsUsed);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [attestChecked, setAttestChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    passed: boolean;
    scorePct: number;
  } | null>(null);

  async function authedFetch(path: string, init: RequestInit = {}) {
    const token = await getToken();
    return fetch(`${API}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch(`/assignments/${assignmentId}/attempts`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const a = (await res.json()) as { id: string };
      setUsed((u) => u + 1);
      setAttemptId(a.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function toggle(qId: string, idx: number, type: Q["type"]) {
    setAnswers((cur) => {
      const prev = cur[qId] ?? [];
      if (type === "SINGLE" || type === "TRUE_FALSE") {
        return { ...cur, [qId]: [idx] };
      }
      return {
        ...cur,
        [qId]: prev.includes(idx)
          ? prev.filter((i) => i !== idx)
          : [...prev, idx],
      };
    });
  }

  async function submit() {
    if (!attemptId) return;
    if (!attestChecked) {
      setError(
        fr
          ? "Vous devez attester avant de soumettre."
          : "You must attest before submitting.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch(
        `/assignments/attempts/${attemptId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: questions.map((q) => ({
              questionId: q.id,
              selectedIdx: answers[q.id] ?? [],
            })),
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Failed (${res.status})`);
      }
      const r = (await res.json()) as { passed: boolean; scorePct: number };
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (completed && certificateId) {
    return (
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-4">
          {fr
            ? "Vous avez complété cette formation."
            : "You've completed this training."}
        </p>
        <CertificateLink certificateId={certificateId} fr={fr} />
      </div>
    );
  }

  const exhausted = used >= maxAttempts;
  const attemptsLine = fr
    ? `Essais utilisés : ${used} sur ${maxAttempts}.`
    : `Attempts used: ${used} of ${maxAttempts}.`;
  const exhaustedMsg = fr
    ? "Vous avez utilisé tous vos essais. Communiquez avec votre administrateur pour une nouvelle attribution."
    : "You've used all your attempts. Contact your administrator for a new assignment.";

  if (!attemptId) {
    return (
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          {fr
            ? `Note de passage : ${passMark}%. ${attemptsLine}`
            : `Pass mark: ${passMark}%. ${attemptsLine}`}
        </p>
        {exhausted ? (
          <p className="mt-6 text-sm text-red-600">{exhaustedMsg}</p>
        ) : (
          <button
            onClick={start}
            disabled={busy}
            className="mt-6 rounded bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "…" : fr ? "Démarrer" : "Start"}
          </button>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-4 text-2xl">
          {result.passed
            ? fr
              ? "Réussi"
              : "Passed"
            : fr
              ? "Échoué"
              : "Failed"}{" "}
          — {result.scorePct}%
        </p>
        {result.passed ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {fr
              ? "Votre attestation est en cours de génération. Elle sera disponible dans votre tableau de bord d'ici quelques instants."
              : "Your certificate is being generated. It will be available in your dashboard within a moment."}
          </p>
        ) : exhausted ? (
          <p className="mt-6 text-sm text-red-600">{exhaustedMsg}</p>
        ) : (
          <button
            onClick={() => {
              setAttemptId(null);
              setAnswers({});
              setResult(null);
              setAttestChecked(false);
            }}
            className="mt-6 rounded border px-5 py-3 font-medium"
          >
            {fr ? "Réessayer" : "Try again"} ({attemptsLine})
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <ol className="mt-8 space-y-8">
        {questions.map((q, qi) => (
          <li key={q.id} className="rounded border p-4">
            <p className="font-medium">
              {qi + 1}. {fr ? q.promptFr : q.promptEn}
            </p>
            <ul className="mt-3 space-y-2">
              {(fr ? q.choicesFr : q.choicesEn).map((c, idx) => {
                const selected = (answers[q.id] ?? []).includes(idx);
                return (
                  <li key={idx}>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type={
                          q.type === "MULTIPLE" ? "checkbox" : "radio"
                        }
                        name={q.id}
                        checked={selected}
                        onChange={() => toggle(q.id, idx, q.type)}
                      />
                      <span>{c}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <label className="mt-8 flex items-start gap-3">
        <input
          type="checkbox"
          checked={attestChecked}
          onChange={(e) => setAttestChecked(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm">
          {fr
            ? "J'atteste que j'ai complété cette formation moi-même et que mes réponses sont véridiques. Mon nom, l'heure et l'adresse IP seront enregistrés."
            : "I attest that I completed this training myself and that my answers are truthful. My name, the time, and my IP address will be recorded."}
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={busy || !attestChecked}
        className="mt-6 rounded bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? "…" : fr ? "Soumettre" : "Submit"}
      </button>
    </div>
  );
}

function CertificateLink({
  certificateId,
  fr,
}: {
  certificateId: string;
  fr: boolean;
}) {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    const token = await getToken();
    const res = await fetch(`${API}/certificates/${certificateId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      window.open(url, "_blank");
    }
    setBusy(false);
  }

  return (
    <button
      onClick={open}
      disabled={busy}
      className="mt-6 rounded bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-50"
    >
      {busy ? "…" : fr ? "Télécharger l'attestation" : "Download certificate"}
    </button>
  );
}
