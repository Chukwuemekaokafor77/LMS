import { apiFetch } from "@/lib/api";
import { InviteStaffForm } from "@/components/invite-staff-form";

type StaffRow = {
  id: string;
  user: { name: string | null; email: string; preferredLocale: string };
  role: { code: string; labelEn: string; labelFr: string };
  site: { id: string; name: string } | null;
  orgPermission: "STAFF" | "SITE_ADMIN" | "ORG_ADMIN";
  startedAt: string | null;
};

async function getStaff(): Promise<StaffRow[]> {
  const res = await apiFetch("/staff");
  if (!res.ok) return [];
  return res.json();
}

export default async function StaffPage() {
  const rows = await getStaff();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff</h1>

      <InviteStaffForm />

      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Site</th>
            <th>Permission</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="py-2">{r.user.name ?? "—"}</td>
              <td>{r.user.email}</td>
              <td>{r.role.labelEn}</td>
              <td>{r.site?.name ?? "—"}</td>
              <td>{r.orgPermission}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-muted-foreground">
                No staff yet. Invite one above or upload a roster CSV.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
