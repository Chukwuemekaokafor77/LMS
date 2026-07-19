"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApi } from "@/lib/client-api";

export function ModuleCreateForm() {
  const api = useApi();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    titleEn: "",
    titleFr: "",
    descriptionEn: "",
    descriptionFr: "",
    durationMin: 30,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const mod = await api<{ id: string }>("/authoring/modules", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push(`/admin/modules/${mod.id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Title (English)
          <input
            required
            minLength={2}
            className={field}
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Titre (français)
          <input
            required
            minLength={2}
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

      <button
        type="submit"
        disabled={busy}
        className="rounded bg-primary px-5 py-2 font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
