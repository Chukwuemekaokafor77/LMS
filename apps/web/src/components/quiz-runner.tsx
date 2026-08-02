"use client";

import { useSession } from "@/lib/session-client";
import { useState } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

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
  const { getToken } = useSession();
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

  const exhausted = used >= maxAttempts;
  const attemptsLine = fr
    ? `Essais utilisés : ${used} sur ${maxAttempts}.`
    : `Attempts used: ${used} of ${maxAttempts}.`;
  const exhaustedMsg = fr
    ? "Vous avez utilisé tous vos essais. Communiquez avec votre administrateur pour une nouvelle attribution."
    : "You've used all your attempts. Contact your administrator for a new assignment.";

  // ── Already completed ──────────────────────────────────────────────────────
  if (completed && certificateId) {
    return (
      <div className="mx-auto max-w-2xl">
        <ResultBanner
          passed
          title={title}
          subtitle={
            fr
              ? "Vous avez complété cette formation."
              : "You've completed this training."
          }
        />
        <div className="mt-6">
          <CertificateLink certificateId={certificateId} fr={fr} />
        </div>
      </div>
    );
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="mx-auto max-w-2xl">
        <ResultBanner
          passed={result.passed}
          title={title}
          score={result.scorePct}
          subtitle={
            result.passed
              ? fr
                ? "Votre attestation est en cours de génération. Elle sera disponible dans votre tableau de bord d'ici quelques instants."
                : "Your certificate is being generated. It will be available in your dashboard within a moment."
              : fr
                ? `Note de passage : ${passMark}%.`
                : `Pass mark: ${passMark}%.`
          }
        />
        {!result.passed &&
          (exhausted ? (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {exhaustedMsg}
            </p>
          ) : (
            <button
              onClick={() => {
                setAttemptId(null);
                setAnswers({});
                setResult(null);
                setAttestChecked(false);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 font-medium transition hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
              {fr ? "Réessayer" : "Try again"}{" "}
              <span className="text-sm text-muted-foreground">
                ({attemptsLine})
              </span>
            </button>
          ))}
      </div>
    );
  }

  // ── Intro / start ──────────────────────────────────────────────────────────
  if (!attemptId) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-sm">
            <Award className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
              {fr ? `Note de passage : ${passMark}%` : `Pass mark: ${passMark}%`}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
              {questions.length} {fr ? "questions" : "questions"}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
              {attemptsLine}
            </span>
          </div>
          {exhausted ? (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {exhaustedMsg}
            </p>
          ) : (
            <button
              onClick={start}
              disabled={busy}
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "…" : fr ? "Démarrer le quiz" : "Start quiz"}
            </button>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  // ── Active quiz ────────────────────────────────────────────────────────────
  const answeredCount = questions.filter(
    (q) => (answers[q.id] ?? []).length > 0,
  ).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {answeredCount}/{questions.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      <ol className="mt-8 space-y-5">
        {questions.map((q, qi) => (
          <li
            key={q.id}
            className="rounded-2xl border border-border bg-background p-5 shadow-sm"
          >
            <p className="font-medium leading-snug">
              <span className="text-muted-foreground">{qi + 1}.</span>{" "}
              {fr ? q.promptFr : q.promptEn}
            </p>
            {q.type === "MULTIPLE" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {fr
                  ? "Sélectionnez toutes les réponses qui s'appliquent."
                  : "Select all that apply."}
              </p>
            )}
            <ul className="mt-4 space-y-2">
              {(fr ? q.choicesFr : q.choicesEn).map((c, idx) => {
                const selected = (answers[q.id] ?? []).includes(idx);
                return (
                  <li key={idx}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type={q.type === "MULTIPLE" ? "checkbox" : "radio"}
                        name={q.id}
                        checked={selected}
                        onChange={() => toggle(q.id, idx, q.type)}
                        className="h-4 w-4 accent-primary"
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

      <label className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
        <input
          type="checkbox"
          checked={attestChecked}
          onChange={(e) => setAttestChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span className="flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {fr
            ? "J'atteste que j'ai complété cette formation moi-même et que mes réponses sont véridiques. Mon nom, l'heure et l'adresse IP seront enregistrés."
            : "I attest that I completed this training myself and that my answers are truthful. My name, the time, and my IP address will be recorded."}
        </span>
      </label>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={busy || !attestChecked}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "…" : fr ? "Soumettre" : "Submit"}
      </button>
    </div>
  );
}

function ResultBanner({
  passed,
  title,
  subtitle,
  score,
}: {
  passed: boolean;
  title: string;
  subtitle: string;
  score?: number;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 text-center shadow-sm ${
        passed ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm ${
          passed ? "bg-green-600" : "bg-red-500"
        }`}
      >
        {passed ? (
          <CheckCircle2 className="h-7 w-7" />
        ) : (
          <XCircle className="h-7 w-7" />
        )}
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>
      {score !== undefined && (
        <p
          className={`mt-2 text-3xl font-bold tabular-nums ${
            passed ? "text-green-600" : "text-red-600"
          }`}
        >
          {score}%
        </p>
      )}
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        {subtitle}
      </p>
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
  const { getToken } = useSession();
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
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
    >
      <Award className="h-4 w-4" />
      {busy ? "…" : fr ? "Télécharger l'attestation" : "Download certificate"}
    </button>
  );
}
