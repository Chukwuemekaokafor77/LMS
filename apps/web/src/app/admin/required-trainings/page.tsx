import { apiFetch } from "@/lib/api";
import { CreateRequiredTrainingForm } from "@/components/create-required-training-form";

type Module = {
  id: string;
  slug: string;
  titleEn: string;
  titleFr: string;
};

type Row = {
  id: string;
  module: { slug: string; titleEn: string; titleFr: string };
  role: { code: string; labelEn: string };
  site: { id: string; name: string } | null;
  cadence: "ONCE" | "ANNUAL" | "TWO_YEARS" | "THREE_YEARS";
  graceDays: number;
};

async function load() {
  const [rt, mods] = await Promise.all([
    apiFetch("/required-trainings"),
    apiFetch("/modules"),
  ]);
  return {
    rows: (rt.ok ? await rt.json() : []) as Row[],
    modules: (mods.ok ? await mods.json() : []) as Module[],
  };
}

export default async function RequiredTrainingsPage() {
  const { rows, modules } = await load();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Required training</h1>
      <p className="text-sm text-muted-foreground">
        For each role, select the modules that staff must complete on a
        recurring cadence. Assignments are generated automatically — both
        for existing staff and any new hires.
      </p>

      <CreateRequiredTrainingForm modules={modules} />

      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="py-2">Module</th>
            <th>Role</th>
            <th>Site</th>
            <th>Cadence</th>
            <th>Grace days</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="py-2">{r.module.titleEn}</td>
              <td>{r.role.code}</td>
              <td>{r.site?.name ?? "All sites"}</td>
              <td>{r.cadence}</td>
              <td>{r.graceDays}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-muted-foreground">
                No required training defined yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
