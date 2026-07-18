import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/me";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();
  if (!me) redirect("/sign-in");
  if (!me.staff) redirect("/onboarding");
  if (me.staff.orgPermission === "STAFF") redirect("/dashboard");

  return (
    <div className="container grid grid-cols-12 gap-8 py-8">
      <aside className="col-span-3 space-y-1 text-sm">
        <h2 className="mb-3 font-semibold">Admin</h2>
        <NavItem href="/admin">Overview</NavItem>
        <NavItem href="/admin/staff">Staff</NavItem>
        <NavItem href="/admin/required-trainings">Required training</NavItem>
        <NavItem href="/admin/reports">Reports</NavItem>
        <NavItem href="/admin/roster">Roster import</NavItem>
      </aside>
      <section className="col-span-9">{children}</section>
    </div>
  );
}

function NavItem({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="block rounded px-3 py-2 hover:bg-muted"
    >
      {children}
    </Link>
  );
}
