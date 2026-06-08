import { redirect } from "next/navigation";
import { getMe } from "@/lib/me";

export default async function AcceptInvitePage() {
  // After Clerk completes sign-up via the invitation link, the API webhook
  // materializes the Staff row. By the time the user lands here, /me will
  // have a staff context — bounce them to the dashboard.
  const me = await getMe();
  if (me?.staff) redirect("/dashboard");

  return (
    <main className="container py-16 text-center">
      <h1 className="text-2xl font-semibold">Finishing your invitation…</h1>
      <p className="mt-2 text-muted-foreground">
        If this page doesn't redirect within a moment, please refresh.
      </p>
    </main>
  );
}
