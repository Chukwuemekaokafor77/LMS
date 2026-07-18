"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function AcceptInvitation({ token, fr }: { token: string; fr: boolean }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const bearer = await getToken();
        const res = await fetch(`${API}/onboarding/accept-invitation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearer}`,
          },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(body.message ?? `Failed (${res.status})`);
        }
        router.push("/dashboard");
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">
          {fr ? "Invitation non acceptée" : "Couldn't accept the invitation"}
        </h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          {fr
            ? "Vérifiez que vous êtes connecté avec l'adresse courriel qui a reçu l'invitation, ou demandez une nouvelle invitation à votre administrateur."
            : "Make sure you're signed in with the email address that received the invitation, or ask your administrator for a new invite."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {fr ? "Acceptation de l'invitation…" : "Accepting your invitation…"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {fr ? "Un instant." : "One moment."}
      </p>
    </div>
  );
}
