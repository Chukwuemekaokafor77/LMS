import { redirect } from "next/navigation";
import { getMe } from "@/lib/me";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const me = await getMe();
  if (me?.staff) redirect("/dashboard");

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-bold">Set up your organization</h1>
      <p className="mt-2 text-muted-foreground">
        Tell us about your nursing home or home-care agency. You'll be the
        first organization administrator and can invite staff afterwards.
      </p>
      <OnboardingForm />
    </main>
  );
}
