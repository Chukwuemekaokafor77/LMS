import type { NextFunction, Request, Response } from "express";
import { withTenantScope } from "./tenant-context";

/**
 * Opens a request-scoped tenant scope (LMS-H1) around the rest of the request,
 * *before* guards run, so the Clerk guard can populate orgId into it and the
 * Prisma guardrail can read it on every PHI query. Must be the outermost
 * middleware. Shared by main.ts (prod) and the e2e harness so both exercise the
 * identical request scoping.
 */
export function tenantScopeMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  withTenantScope(() => next());
}
