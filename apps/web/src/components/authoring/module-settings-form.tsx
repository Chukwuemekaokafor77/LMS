"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApi } from "@/lib/client-api";

type Mod = {
  id: string;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  durationMin: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export function ModuleSettingsForm({ module: mod }: { module: Mod }) {
  const api = useApi();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    titleEn: mod.titleEn,
    titleFr: mod.titleFr,
    descriptionEn: mod.descriptionEn,
    descriptionFr: mod.descriptionFr,
    durationMin: mod.durationMin,
  });

  async function patch(body: object, action: string) {
    setBusy(action);
    setError(null);
    setSaved(false);
    try {
      await api(`/authoring/modules/${mod.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setSaved(action === "save");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const field =
    "mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void patch(form, "save");
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Title (English)
          <input
            required
            className={field}
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Titre (français)
          <input
            required
            className={field}
            value={form.titleFr}
            onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Description (English)
          <textarea
            required
            rows={3}
            className={field}
            value={form.descriptionEn}
            onChange={(e) =>
              setForm({ ...form, descriptionEn: e.target.value })
            }
          />
        </label>
        <label className="block text-sm font-medium">
          Description (français)
          <textarea
            required
            rows={3}
            className={field}
            value={form.descriptionFr}
            onChange={(e) =>
              setForm({ ...form, descriptionFr: e.target.value })
            }
          />
        </label>
      </div>
      <label className="block w-40 text-sm font-medium">
        Duration (minutes)
        <input
          type="number"
          min={1}
          max={600}
          required
          className={field}
          value={form.durationMin}
          onChange={(e) =>
            setForm({ ...form, durationMin: Number(e.target.value) })
          }
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Saved.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy !== null}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy === "save" ? "Saving…" : "Save settings"}
        </button>
        {mod.status !== "PUBLISHED" ? (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void patch({ status: "PUBLISHED" }, "publish")}
            className="rounded border border-green-600 px-5 py-2 text-sm font-medium text-green-700 disabled:opacity-50"
          >
            {busy === "publish" ? "Publishing…" : "Publish"}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void patch({ status: "DRAFT" }, "unpublish")}
            className="rounded border px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy === "unpublish" ? "Unpublishing…" : "Unpublish"}
          </button>
        )}
        {mod.status !== "ARCHIVED" && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void patch({ status: "ARCHIVED" }, "archive")}
            className="rounded border border-red-300 px-5 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
          >
            {busy === "archive" ? "Archiving…" : "Archive"}
          </button>
        )}
      </div>
    </form>
  );
}
