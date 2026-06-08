import { Prisma } from "@prisma/client";
import { getTenantContext, type TenantContext } from "../tenant/tenant-context";

/**
 * Tenant-isolation guardrail (LMS-H1).
 *
 * Replaces the old "assert the caller put `orgId` in the where clause" design
 * — which was simultaneously a dev landmine (it tripped on every legitimate
 * `findUnique`-by-id and relation-scoped read) and a prod no-op (it only
 * `console.error`'d, and `"orgId" in where` was true even for
 * `orgId: undefined`). Instead this *injects* `orgId` from the request-scoped
 * context, so isolation is automatic and a missing context fails closed.
 *
 * The transform is a pure function ({@link scopeQueryArgs}) so it can be
 * unit-tested without a database; the extension is just the Prisma glue.
 */
export const PHI_MODELS = new Set([
  "Staff",
  "Assignment",
  "Attempt",
  "Certificate",
  "RosterImport",
]);

/** Operations whose `where` we scope by injecting `orgId` as an AND filter. */
const WHERE_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "findMany",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "count",
  "aggregate",
  "groupBy",
]);

type AnyArgs = Record<string, unknown>;

/**
 * Pure core of the guardrail. Given the model, operation, the caller's args and
 * the active tenant context, returns the args that should actually run.
 *
 *  - Non-PHI model            → args untouched (no context required).
 *  - PHI model, no context    → throws (fail closed, every environment).
 *  - PHI model, system actor  → args untouched (explicit cross-org escape).
 *  - PHI model, org actor      → `orgId` injected into where/data.
 *
 * `orgId` is always *overwritten* with the context's value (never merged from
 * the caller), so a request can neither widen its scope nor slip through with
 * `orgId: undefined`. Prisma 5's "extended where unique" makes injecting a
 * non-unique `orgId` filter valid even for findUnique/update/delete.
 */
export function scopeQueryArgs(
  model: string | undefined,
  operation: string,
  args: unknown,
  ctx: TenantContext | null,
): unknown {
  if (!model || !PHI_MODELS.has(model)) return args;

  if (!ctx) {
    throw new Error(
      `Tenant isolation: ${model}.${operation} ran with no tenant context. ` +
        `HTTP requests must pass through the tenant-scope middleware; ` +
        `background jobs/webhooks must wrap PHI access in runWithOrgContext() or runAsSystem().`,
    );
  }

  if (ctx.kind === "system") return args;

  const orgId = ctx.orgId;
  const a: AnyArgs = { ...((args as AnyArgs) ?? {}) };

  if (operation === "create") {
    a.data = { ...((a.data as AnyArgs) ?? {}), orgId };
  } else if (operation === "createMany") {
    const data = a.data;
    a.data = Array.isArray(data)
      ? data.map((d) => ({ ...(d as AnyArgs), orgId }))
      : { ...((data as AnyArgs) ?? {}), orgId };
  } else if (operation === "upsert") {
    // Scope which row we target and stamp the org on creation. The `update`
    // branch is constrained by the orgId-scoped `where`, so it can't touch
    // another org's row.
    a.where = { ...((a.where as AnyArgs) ?? {}), orgId };
    a.create = { ...((a.create as AnyArgs) ?? {}), orgId };
  } else if (WHERE_OPS.has(operation)) {
    a.where = { ...((a.where as AnyArgs) ?? {}), orgId };
  }

  return a;
}

export const tenantIsolationExtension = Prisma.defineExtension({
  name: "tenantIsolation",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const scoped = scopeQueryArgs(
          model,
          operation,
          args,
          getTenantContext(),
        ) as typeof args;
        return query(scoped);
      },
    },
  },
});
