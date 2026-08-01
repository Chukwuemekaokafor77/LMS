"use client";

import { useSession } from "@/lib/session-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Playback = { playbackId: string; token: string };

export function LessonPlayer({
  lessonId,
  videoStatus,
  body,
  initiallyCompleted,
  fr,
  nextHref,
  moduleHref,
}: {
  lessonId: string;
  videoStatus: string;
  body: string | null;
  initiallyCompleted: boolean;
  fr: boolean;
  nextHref: string | null;
  moduleHref: string;
}) {
  const { getToken } = useSession();
  const router = useRouter();
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [error, setError] = useState<string | null>(null);

  const ready = videoStatus === "READY";

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API}/lessons/${lessonId}/playback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Playback failed (${res.status})`);
        const p = (await res.json()) as Playback;
        if (!cancelled) setPlayback(p);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, ready]);

  async function markComplete() {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setCompleted(true);
      // Refresh the RSC tree so the module page's progress + quiz lock update.
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      {ready ? (
        playback ? (
          <MuxPlayer
            playbackId={playback.playbackId}
            tokens={{ playback: playback.token }}
            streamType="on-demand"
            onEnded={markComplete}
            style={{ width: "100%", aspectRatio: "16 / 9" }}
          />
        ) : error ? (
          <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {fr
              ? "Impossible de charger la vidéo. Réessayez plus tard."
              : "Could not load the video. Please try again later."}{" "}
            ({error})
          </p>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded bg-muted text-sm text-muted-foreground">
            {fr ? "Chargement de la vidéo…" : "Loading video…"}
          </div>
        )
      ) : body ? (
        <article className="max-w-3xl space-y-4 text-[15px] leading-relaxed">
          {body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>
      ) : (
        <p className="rounded border p-4 text-sm text-muted-foreground">
          {fr
            ? "Le contenu de cette leçon n'est pas encore disponible."
            : "This lesson's content isn't available yet."}
        </p>
      )}

      {/* Reading lessons (no video) are completed with an explicit button — a
          video lesson auto-completes on end via onEnded above. */}
      {!ready && body && !completed && (
        <div className="mt-6">
          <button
            type="button"
            onClick={markComplete}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {fr ? "Marquer la leçon comme complétée" : "Mark lesson complete"}
          </button>
        </div>
      )}

      {/* Video-load errors render inline in the player above; this covers the
          reading path (e.g. a failed "mark complete"). */}
      {!ready && error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {fr
            ? "Une erreur est survenue. Réessayez."
            : "Something went wrong. Please try again."}{" "}
          ({error})
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        {completed && (
          <span className="text-sm font-medium text-green-600">
            {fr ? "✓ Leçon complétée" : "✓ Lesson completed"}
          </span>
        )}
        {completed &&
          (nextHref ? (
            <Link
              href={nextHref}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              {fr ? "Leçon suivante" : "Next lesson"}
            </Link>
          ) : (
            <Link
              href={moduleHref}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              {fr ? "Retour au module" : "Back to module"}
            </Link>
          ))}
      </div>
    </div>
  );
}
