/**
 * Provider-agnostic identity seam (LMS-M6 decommission plan, step 1).
 *
 * The auth guard and current-user resolution depend on this interface instead
 * of Clerk directly, so the eventual cutover to the ElderCare OIDC verifier is
 * a provider swap behind one injection token — not a rewrite of the audited
 * request → context → guardrail chain. Clerk remains the only implementation
 * until the swap is un-gated (ElderCare must ship an OIDC provider first).
 */

/** Result of verifying a bearer token. */
export type VerifiedIdentity = {
  /** The provider's stable subject for the user (today: the Clerk user id). */
  externalId: string;
  sessionId?: string;
};

/** Profile data needed to provision a local User on first sight. */
export type IdentityProfile = {
  externalId: string;
  email: string;
  name: string | null;
};

export interface IdentityProvider {
  /** Verify a bearer token and return the subject. Throw on any failure. */
  verifyBearer(token: string): Promise<VerifiedIdentity>;
  /** Fetch the profile for a subject (used on first-login user provisioning). */
  fetchProfile(externalId: string): Promise<IdentityProfile>;
}

/** Nest injection token — bind the active provider implementation to this. */
export const IDENTITY_PROVIDER = "IDENTITY_PROVIDER";
