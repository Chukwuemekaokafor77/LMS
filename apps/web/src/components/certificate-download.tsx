"use client";

import { useSession } from "@/lib/session-client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function CertificateDownload({
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
      className="rounded border px-3 py-1 text-xs disabled:opacity-50"
    >
      {busy ? "…" : fr ? "Attestation" : "Certificate"}
    </button>
  );
}
