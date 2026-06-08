import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ClerkService } from "./clerk.service";
import { CurrentUserService } from "./current-user.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { PrismaService } from "../prisma/prisma.service";
import type { StaffContext } from "../tenant/tenant.types";

export type AuthedRequest = Request & {
  auth?: { clerkUserId: string; sessionId?: string };
  user?: { id: string; email: string };
  staff?: StaffContext;
};

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly clerk: ClerkService,
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

    let payload;
    try {
      payload = await this.clerk.verifyBearer(token);
    } catch {
      throw new UnauthorizedException("Invalid token");
    }

    const clerkUserId = payload.sub;
    if (!clerkUserId) throw new UnauthorizedException("Invalid token subject");

    const user = await this.currentUser.upsertFromClerk(clerkUserId);
    req.auth = { clerkUserId, sessionId: payload.sid };
    req.user = { id: user.id, email: user.email };

    const staff = await this.prisma.staff.findUnique({
      where: { userId: user.id },
      include: { org: { select: { jurisdiction: true } } },
    });
    if (staff) {
      req.staff = {
        staffId: staff.id,
        orgId: staff.orgId,
        siteId: staff.siteId,
        orgPermission: staff.orgPermission,
        roleCode: staff.roleCode,
        jurisdiction: staff.org.jurisdiction,
      };
    }
    return true;
  }
}
