/**
 * Provider-agnostic identity seam. The auth guard and current-user resolution
 * depend on this interface, not on a concrete provider, so the identity source
 * is a one-line binding swap. Current impl: ElderCare Academy session tokens
 * (Clerk was decommissioned — LMS-M6 complete).
 */

/** Result of verifying a bearer token. */
export type VerifiedIdentity = {
  /** The provider's stable subject for the user (the ElderCare user id). */
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
