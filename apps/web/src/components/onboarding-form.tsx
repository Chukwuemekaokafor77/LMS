"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const JURISDICTIONS = [
  { code: "NB", labelEn: "New Brunswick", labelFr: "Nouveau-Brunswick" },
  { code: "NS", labelEn: "Nova Scotia", labelFr: "Nouvelle-Écosse" },
  { code: "PE", labelEn: "Prince Edward Island", labelFr: "Île-du-Prince-Édouard" },
  { code: "NL", labelEn: "Newfoundland & Labrador", labelFr: "Terre-Neuve-et-Labrador" },
  { code: "ON", labelEn: "Ontario", labelFr: "Ontario" },
] as const;

export function OnboardingForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(ev.currentTarget);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/onboarding/organization`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: fd.get("name"),
            jurisdiction: fd.get("jurisdiction"),
            siteName: fd.get("siteName"),
            siteAddress: fd.get("siteAddress") || undefined,
            regulatorLicenseNumber: fd.get("license") || undefined,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Failed (${res.status})`);
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-5">
      <Field label="Organization name" name="name" required />
      <div>
        <label className="block text-sm font-medium">Jurisdiction</label>
        <select
          name="jurisdiction"
          defaultValue="NB"
          className="mt-1 w-full rounded border px-3 py-2"
          required
        >
          {JURISDICTIONS.map((j) => (
            <option key={j.code} value={j.code}>
              {j.labelEn} / {j.labelFr}
            </option>
          ))}
        </select>
      </div>
      <Field label="First site name" name="siteName" required />
      <Field label="Site address (optional)" name="siteAddress" />
      <Field label="Regulator license number (optional)" name="license" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-primary px-5 py-2.5 font-medium text-primary-foreground disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create organization"}
      </button>
    </form>
  );
}

function Field(props: { label: string; name: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor={props.name}>
        {props.label}
      </label>
      <input
        id={props.name}
        name={props.name}
        required={props.required}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </div>
  );
}
