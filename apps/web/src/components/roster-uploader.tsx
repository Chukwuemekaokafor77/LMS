"use client";

import { useAuth } from "@clerk/nextjs";
import { ChangeEvent, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Status = {
  id: string;
  status: string;
  rowsProcessed: number;
  rowsErrored: number;
  errors?: { row: number; email?: string; reason: string }[];
};

export function RosterUploader() {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  async function authedFetch(path: string, init: RequestInit) {
    const token = await getToken();
    return fetch(`${API}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function onFile(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const startRes = await authedFetch("/roster-imports/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      if (!startRes.ok) throw new Error(`start failed (${startRes.status})`);
      const { importId, uploadUrl } = (await startRes.json()) as {
        importId: string;
        uploadUrl: string;
      };

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "text/csv" },
        body: file,
      });
      if (!putRes.ok) throw new Error(`S3 upload failed (${putRes.status})`);

      const commitRes = await authedFetch("/roster-imports/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId }),
      });
      if (!commitRes.ok) throw new Error("commit failed");

      // Poll once for visible feedback; the worker is async.
      setTimeout(async () => {
        const r = await authedFetch(`/roster-imports/${importId}`, {});
        if (r.ok) setStatus(await r.json());
      }, 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={onFile}
        disabled={busy}
        className="rounded border p-3"
      />
      {busy && <p className="text-sm text-muted-foreground">Uploading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {status && (
        <div className="rounded border p-4 text-sm">
          <p>
            <strong>Status:</strong> {status.status}
          </p>
          <p>Rows processed: {status.rowsProcessed}</p>
          <p>Rows errored: {status.rowsErrored}</p>
          {status.errors && status.errors.length > 0 && (
            <details className="mt-2">
              <summary>Errors</summary>
              <ul className="mt-2 list-disc pl-5">
                {status.errors.map((e, i) => (
                  <li key={i}>
                    Row {e.row}
                    {e.email ? ` (${e.email})` : ""}: {e.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
