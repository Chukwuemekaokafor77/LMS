import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Request-scoped tenant context (LMS-H1).
 *
 * The tenant-isolation Prisma extension reads this to *inject* `orgId` into
 * every PHI query/write — so isolation is automatic instead of something each
 * call site has to remember. There are exactly two shapes:
 *
 *   - `{ kind: "org" }`  — a normal request/job scoped to one organization.
 *   - `{ kind: "system" }` — the explicit, greppable escape for genuinely
 *     cross-org work (the retention sweep, tenant bootstrap, the
 *     one-org-per-user existence check). Nothing is auto-scoped under it.
 *
 * If a PHI query runs with *no* context at all, the extension fails closed
 * (throws) in every environment — a 500 is safer than a cross-tenant leak.
 */
export type TenantContext =
  | { kind: "org"; orgId: string }
  | { kind: "system" };

/**
 * The store is a *mutable holder* rather than the context value itself: the
 * scope is opened up-front by middleware (before auth runs), then the Clerk
 * guard fills in `orgId` once it has resolved the actor — all within the same
 * async context, so later DB calls in the request see it.
 */
type TenantStore = { context: TenantContext | null };

const storage = new AsyncLocalStorage<TenantStore>();

/**
 * Open an empty tenant scope for the lifetime of `fn` (one per HTTP request,
 * installed as the outermost middleware). The Clerk guard calls
 * {@link setOrgContext} later to populate it.
 */
export function withTenantScope<T>(fn: () => T): T {
  return storage.run({ context: null }, fn);
}

/**
 * Populate the current request's org context. Called by the Clerk guard after
 * it resolves the actor's `Staff` row. Throws if there is no open scope (a
 * wiring bug — the middleware must run first).
 */
export function setOrgContext(orgId: string): void {
  const store = storage.getStore();
  if (!store) {
    throw new Error(
      "setOrgContext() called with no open tenant scope — is the tenant-scope middleware installed?",
    );
  }
  store.context = { kind: "org", orgId };
}

/**
 * Run `fn` with an explicit org context. For background jobs / webhook handlers
 * that know which org they act for but run outside the HTTP request scope
 * (e.g. the Clerk-webhook invitation acceptance, which carries `orgId`).
 */
export function runWithOrgContext<T>(orgId: string, fn: () => T): T {
  return storage.run({ context: { kind: "org", orgId } }, fn);
}

/**
 * Run `fn` as a cross-org system actor — the explicit escape from tenant
 * scoping. Deliberately greppable: every legitimate cross-org access (retention
 * sweep, tenant bootstrap, global existence checks) is wrapped in this, so an
 * audit can find them all. Under it, the extension performs no injection.
 */
export function runAsSystem<T>(fn: () => T): T {
  return storage.run({ context: { kind: "system" } }, fn);
}

/** The active tenant context, or `null` if outside any scope. */
export function getTenantContext(): TenantContext | null {
  return storage.getStore()?.context ?? null;
}
