import { apiFetch } from "@/lib/api";

async function getCounts() {
  const [staff, rt] = await Promise.all([
    apiFetch("/staff"),
    apiFetch("/required-trainings"),
  ]);
  return {
    staff: staff.ok ? ((await staff.json()) as unknown[]).length : 0,
    requiredTrainings: rt.ok ? ((await rt.json()) as unknown[]).length : 0,
  };
}

export default async function AdminOverview() {
  const c = await getCounts();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Active staff" value={c.staff} />
        <Card title="Required-training policies" value={c.requiredTrainings} />
      </div>
      <p className="text-sm text-muted-foreground">
        Set up at least one required-training policy per role before assignments
        will materialize. Reports become useful once staff start completing them.
      </p>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
