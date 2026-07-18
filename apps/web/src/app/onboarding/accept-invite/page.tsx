import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/me";
import { AcceptInvitation } from "@/components/accept-invitation";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const me = await getMe();

  // Already staff somewhere → nothing to accept.
  if (me?.staff) redirect("/dashboard");

  const fr = me?.user.preferredLocale === "fr-CA";

  if (!token) {
    return (
      <main className="container py-16 text-center">
        <h1 className="text-2xl font-semibold">
          {fr ? "Lien d'invitation invalide" : "Invalid invitation link"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {fr
            ? "Ce lien est incomplet. Utilisez le lien du courriel d'invitation."
            : "This link is incomplete. Please use the link from your invitation email."}
        </p>
      </main>
    );
  }

  if (!me) {
    // Sign in / up first, then come back here with the token intact.
    const back = encodeURIComponent(
      `/onboarding/accept-invite?token=${encodeURIComponent(token)}`,
    );
    return (
      <main className="container py-16 text-center">
        <h1 className="text-2xl font-semibold">You're invited</h1>
        <p className="mt-2 text-muted-foreground">
          Create an account (or sign in) with the email address this invitation
          was sent to, and you'll be added to your organization.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href={`/sign-up?redirect_url=${back}`}
            className="rounded bg-primary px-5 py-3 font-medium text-primary-foreground"
          >
            Create account
          </Link>
          <Link
            href={`/sign-in?redirect_url=${back}`}
            className="rounded border px-5 py-3 font-medium"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-16 text-center">
      <AcceptInvitation token={token} fr={fr} />
    </main>
  );
}
