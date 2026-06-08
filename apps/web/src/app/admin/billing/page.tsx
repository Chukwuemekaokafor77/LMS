import { BillingActions } from "@/components/billing-actions";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="text-sm text-muted-foreground">
        Maple Care is per-staff-seat. Add seats to start a subscription;
        Stripe handles GST/HST automatically via Stripe Tax.
      </p>
      <BillingActions />
    </div>
  );
}
