import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import {
  IDENTITY_PROVIDER,
  type IdentityProvider,
  type VerifiedIdentity,
} from "./identity-provider";
import { CurrentUserService } from "./current-user.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { PrismaService } from "../prisma/prisma.service";
import type { StaffContext } from "../tenant/tenant.types";
import { runAsSystem, setOrgContext } from "../tenant/tenant-context";

export type AuthedRequest = Request & {
  auth?: { externalAuthId: string; sessionId?: string };
  user?: { id: string; email: string };
  staff?: StaffContext;
};

/**
 * Global auth guard. Verifies the bearer token via the active
 * {@link IdentityProvider} (post-cutover: ElderCare Academy session tokens),
 * provisions/loads the User, and opens the request's tenant scope. Provider-
 * agnostic by design — see the LMS-M6 decommission plan.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    private readonly currentUser: CurrentUserService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException("Missing bearer token");

    let identity: VerifiedIdentity;
    try {
      identity = await this.identity.verifyBearer(token);
    } catch {
      throw new UnauthorizedException("Invalid token");
    }

    const user = await this.currentUser.upsertFromIdentity(identity.externalId);
    req.auth = { externalAuthId: identity.externalId, sessionId: identity.sessionId };
    req.user = { id: user.id, email: user.email };

    // Bootstrap lookup: this is the query that *discovers* the actor's org, so
    // it can't itself be org-scoped (chicken-and-egg). userId is globally
    // unique, so a system read returns exactly this user's single Staff row.
    const staff = await runAsSystem(
      async () =>
        await this.prisma.staff.findUnique({
          where: { userId: user.id },
          include: { org: { select: { jurisdiction: true } } },
        }),
    );
    if (staff) {
      req.staff = {
        staffId: staff.id,
        userId: staff.userId,
        orgId: staff.orgId,
        siteId: staff.siteId,
        orgPermission: staff.orgPermission,
        roleCode: staff.roleCode,
        jurisdiction: staff.org.jurisdiction,
      };
      // Populate the request's tenant scope so every PHI query for the rest of
      // the request is auto-scoped to this org by the Prisma guardrail.
      setOrgContext(staff.orgId);
    }
    return true;
  }
}
