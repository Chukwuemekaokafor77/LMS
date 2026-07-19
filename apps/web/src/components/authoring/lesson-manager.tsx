"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useApi } from "@/lib/client-api";

type Lesson = {
  id: string;
  titleEn: string;
  titleFr: string;
  position: number;
  isPreview: boolean;
  videoStatus: string;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "no video",
  UPLOADING: "uploading…",
  PROCESSING: "processing…",
  READY: "ready",
  ERRORED: "video error",
};

export function LessonManager({
  moduleId,
  lessons,
}: {
  moduleId: string;
  lessons: Lesson[];
}) {
  const api = useApi();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ titleEn: "", titleFr: "" });
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function addLesson(e: React.FormEvent) {
    e.preventDefault();
    void run(async () => {
      await api(`/authoring/modules/${moduleId}/lessons`, {
        method: "POST",
        body: JSON.stringify(newLesson),
      });
      setNewLesson({ titleEn: "", titleFr: "" });
    });
  }

  function move(index: number, dir: -1 | 1) {
    const ids = lessons.map((l) => l.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    void run(() =>
      api(`/authoring/modules/${moduleId}/lessons/order`, {
        method: "PUT",
        body: JSON.stringify({ lessonIds: ids }),
      }),
    );
  }

  async function upload(lessonId: string, file: File) {
    setUploadingId(lessonId);
    setError(null);
    try {
      const { uploadUrl } = await api<{ uploadUrl: string }>(
        `/lessons/${lessonId}/upload`,
        { method: "POST" },
      );
      const put = await fetch(uploadUrl, { method: "PUT", body: file });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div>
      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lessons yet.</p>
      ) : (
        <ol className="space-y-2">
          {lessons.map((l, i) => (
            <li
              key={l.id}
              className="flex items-center gap-3 rounded border p-3 text-sm"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={busy || i === 0}
                  onClick={() => move(i, -1)}
                  className="text-xs text-muted-foreground disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={busy || i === lessons.length - 1}
                  onClick={() => move(i, 1)}
                  className="text-xs text-muted-foreground disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <div className="flex-1">
                <span className="font-medium">
                  {i + 1}. {l.titleEn}
                </span>
                <span className="ml-2 text-muted-foreground">{l.titleFr}</span>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{STATUS_LABEL[l.videoStatus] ?? l.videoStatus}</span>
                  <label className="flex cursor-pointer items-center gap-1">
                    <input
                      type="checkbox"
                      checked={l.isPreview}
                      disabled={busy}
                      onChange={(e) =>
                        void run(() =>
                          api(`/authoring/lessons/${l.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({
                              isPreview: e.target.checked,
                            }),
                          }),
                        )
                      }
                    />
                    preview
                  </label>
                </div>
              </div>
              <input
                ref={(el) => {
                  fileInputs.current[l.id] = el;
                }}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(l.id, f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={busy || uploadingId !== null}
                onClick={() => fileInputs.current[l.id]?.click()}
                className="rounded border px-3 py-1 text-xs disabled:opacity-50"
              >
                {uploadingId === l.id ? "Uploading…" : "Upload video"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (confirm(`Delete lesson "${l.titleEn}"?`)) {
                    void run(() =>
                      api(`/authoring/lessons/${l.id}`, { method: "DELETE" }),
                    );
                  }
                }}
                className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={addLesson} className="mt-4 flex items-end gap-3">
        <label className="flex-1 text-xs font-medium">
          New lesson title (English)
          <input
            required
            minLength={2}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={newLesson.titleEn}
            onChange={(e) =>
              setNewLesson({ ...newLesson, titleEn: e.target.value })
            }
          />
        </label>
        <label className="flex-1 text-xs font-medium">
          Titre (français)
          <input
            required
            minLength={2}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={newLesson.titleFr}
            onChange={(e) =>
              setNewLesson({ ...newLesson, titleFr: e.target.value })
            }
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Add lesson
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
