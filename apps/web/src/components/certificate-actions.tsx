"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { useSession } from "@/lib/session-client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Certificate view actions: download the signed PDF, or print the on-page
 * certificate (the print stylesheet hides everything but the certificate).
 * Hidden from print output via `print:hidden`.
 */
export function CertificateActions({
  certificateId,
  fr,
}: {
  certificateId: string;
  fr: boolean;
}) {
  const { getToken } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function download() {
    setBusy(true);
    setError(false);
    try {
      const token = await getToken();
      const res = await fetch(
        `${API}/certificates/${certificateId}/download`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error();
      const { url } = (await res.json()) as { url: string };
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="print:hidden">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {busy
            ? "…"
            : fr
              ? "Télécharger le PDF"
              : "Download PDF"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 font-medium transition hover:bg-muted"
        >
          <Printer className="h-4 w-4" />
          {fr ? "Imprimer" : "Print"}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-center text-sm text-red-600">
          {fr
            ? "Le téléchargement a échoué. Réessayez."
            : "Download failed. Please try again."}
        </p>
      )}
    </div>
  );
}
