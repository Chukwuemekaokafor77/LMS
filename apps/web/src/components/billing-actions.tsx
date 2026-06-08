"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export function BillingActions() {
  const { getToken } = useAuth();
  const [seats, setSeats] = useState(25);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/billing/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ seats }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Failed (${res.status})`);
      }
      const { url } = await res.json();
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="rounded border p-5">
      <label className="block text-sm font-medium">Number of staff seats</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="number"
          min={1}
          max={5000}
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="w-32 rounded border px-3 py-2"
        />
        <button
          onClick={start}
          disabled={busy}
          className="rounded bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Redirecting…" : "Start subscription"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
