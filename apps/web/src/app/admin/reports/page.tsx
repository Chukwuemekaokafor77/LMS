import { ReportFilters } from "@/components/report-filters";
import { apiFetch } from "@/lib/api";

type Row = {
  id: string;
  completedAt: string | null;
  staff: {
    user: { name: string | null; email: string };
    site: { name: string } | null;
    role: { code: string };
  };
  module: { slug: string; titleEn: string };
  attempts: { scorePct: number | null; attestationHash: string | null }[];
  certificate: { sha256: string } | null;
};

async function load(searchParams: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) if (v) qs.set(k, v);
  const res = await apiFetch(`/reports/completions?${qs.toString()}`);
  return (res.ok ? await res.json() : []) as Row[];
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const rows = await load(sp);
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v) qs.set(k, v);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-sm text-muted-foreground">
        Completions filtered by site, module, and date range. CSV and PDF
        exports match the format expected by NB Department of Social
        Development inspectors.
      </p>

      <ReportFilters />

      <div className="flex gap-3">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/reports/completions/csv?${qs.toString()}`}
          className="rounded border px-4 py-2 text-sm"
        >
          Download CSV
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/reports/completions/pdf?${qs.toString()}`}
          className="rounded border px-4 py-2 text-sm"
        >
          Download PDF
        </a>
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="py-2">Completed</th>
            <th>Site</th>
            <th>Staff</th>
            <th>Role</th>
            <th>Module</th>
            <th>Score</th>
            <th>Attestation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="py-2">
                {r.completedAt
                  ? new Date(r.completedAt).toLocaleDateString("en-CA")
                  : "—"}
              </td>
              <td>{r.staff.site?.name ?? "—"}</td>
              <td>{r.staff.user.name ?? r.staff.user.email}</td>
              <td>{r.staff.role.code}</td>
              <td>{r.module.titleEn}</td>
              <td>
                {r.attempts[0]?.scorePct != null
                  ? `${r.attempts[0].scorePct}%`
                  : "—"}
              </td>
              <td className="font-mono text-xs">
                {r.attempts[0]?.attestationHash?.slice(0, 12) ?? "—"}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-muted-foreground">
                No completions match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
