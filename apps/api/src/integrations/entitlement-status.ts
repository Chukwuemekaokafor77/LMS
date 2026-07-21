/**
 * The ElderCare subscription states that grant Academy access. Shared by the
 * SSO gate (at handoff), the entitlement webhook (mid-session updates), and the
 * auth guard (mid-session enforcement) so all three agree on what "active"
 * means. Pure — no Nest DI — so it can be imported anywhere without wiring.
 *
 * ElderCare's states mirror the usual subscription vocabulary (Stripe-like):
 * "active"/"trialing" grant access; "past_due"/"canceled"/"unpaid"/"incomplete"
 * etc. do not.
 */
export const ACTIVE_ENTITLEMENT_STATUSES = new Set(["active", "trialing"]);

export function isEntitlementActive(status: string | null | undefined): boolean {
  return ACTIVE_ENTITLEMENT_STATUSES.has(status ?? "");
}
