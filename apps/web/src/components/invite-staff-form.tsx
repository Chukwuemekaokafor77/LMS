"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const NB_ROLE_OPTIONS = [
  { code: "NB_RA", label: "Resident Assistant" },
  { code: "NB_PCW", label: "Personal Care Worker" },
  { code: "NB_RPN", label: "Licensed Practical Nurse" },
  { code: "NB_RN", label: "Registered Nurse" },
  { code: "NB_ACTIVATION", label: "Recreation / Activation" },
  { code: "NB_DIETARY", label: "Dietary Aide" },
  { code: "NB_HOUSEKEEPING", label: "Housekeeping" },
  { code: "NB_ADMIN", label: "Administration" },
];

export function InviteStaffForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setBusy(true);
    setMsg(null);
    const fd = new FormData(ev.currentTarget);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/staff/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: fd.get("email"),
            roleCode: fd.get("roleCode"),
            orgPermission: fd.get("orgPermission") || "STAFF",
            employmentType: fd.get("employmentType") || undefined,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Failed (${res.status})`);
      }
      setMsg({ kind: "ok", text: "Invitation sent." });
      (ev.target as HTMLFormElement).reset();
      router.refresh();
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded border p-4 md:grid-cols-5"
    >
      <input
        name="email"
        type="email"
        placeholder="staff@example.com"
        required
        className="rounded border px-3 py-2 md:col-span-2"
      />
      <select name="roleCode" required className="rounded border px-3 py-2">
        {NB_ROLE_OPTIONS.map((r) => (
          <option key={r.code} value={r.code}>
            {r.label}
          </option>
        ))}
      </select>
      <select name="orgPermission" className="rounded border px-3 py-2" defaultValue="STAFF">
        <option value="STAFF">Staff</option>
        <option value="SITE_ADMIN">Site admin</option>
        <option value="ORG_ADMIN">Org admin</option>
      </select>
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Sending…" : "Invite"}
      </button>
      {msg && (
        <p
          className={`md:col-span-5 text-sm ${
            msg.kind === "err" ? "text-red-600" : "text-green-700"
          }`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
