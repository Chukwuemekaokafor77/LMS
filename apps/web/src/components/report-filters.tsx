"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

export function ReportFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const qs = new URLSearchParams();
    const fields = ["from", "to", "module", "siteId"];
    for (const f of fields) {
      const v = (fd.get(f) ?? "").toString();
      if (v) qs.set(f, v);
    }
    router.push(`/admin/reports?${qs.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-2 gap-3 rounded border p-4 md:grid-cols-4"
    >
      <input
        name="from"
        type="date"
        defaultValue={sp.get("from") ?? ""}
        className="rounded border px-3 py-2"
      />
      <input
        name="to"
        type="date"
        defaultValue={sp.get("to") ?? ""}
        className="rounded border px-3 py-2"
      />
      <input
        name="module"
        placeholder="module slug"
        defaultValue={sp.get("module") ?? ""}
        className="rounded border px-3 py-2"
      />
      <button className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Apply filters
      </button>
    </form>
  );
}
