"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const NB_ROLES = [
  "NB_RA",
  "NB_PCW",
  "NB_RPN",
  "NB_RN",
  "NB_ACTIVATION",
  "NB_DIETARY",
  "NB_HOUSEKEEPING",
  "NB_ADMIN",
];

export function CreateRequiredTrainingForm({
  modules,
}: {
  modules: { id: string; titleEn: string }[];
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(ev.currentTarget);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/required-trainings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roleCode: fd.get("roleCode"),
            moduleId: fd.get("moduleId"),
            cadence: fd.get("cadence"),
            graceDays: Number(fd.get("graceDays") ?? 30),
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Failed (${res.status})`);
      }
      (ev.target as HTMLFormElement).reset();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded border p-4 md:grid-cols-5"
    >
      <select name="roleCode" required className="rounded border px-3 py-2">
        {NB_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        name="moduleId"
        required
        className="rounded border px-3 py-2 md:col-span-2"
      >
        {modules.map((m) => (
          <option key={m.id} value={m.id}>
            {m.titleEn}
          </option>
        ))}
      </select>
      <select name="cadence" required className="rounded border px-3 py-2">
        <option value="ONCE">Once</option>
        <option value="ANNUAL">Annual</option>
        <option value="TWO_YEARS">Every 2 years</option>
        <option value="THREE_YEARS">Every 3 years</option>
      </select>
      <input
        name="graceDays"
        type="number"
        min={0}
        max={365}
        defaultValue={30}
        className="rounded border px-3 py-2"
        placeholder="Grace days"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50 md:col-span-5"
      >
        {busy ? "Adding…" : "Add required training"}
      </button>
      {error && <p className="md:col-span-5 text-sm text-red-600">{error}</p>}
    </form>
  );
}
