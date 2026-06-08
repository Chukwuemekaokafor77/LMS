import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap } from "rxjs";
import type { AuthedRequest } from "../auth/clerk-auth.guard";
import { RecordAccessService } from "./record-access.service";
import {
  PHI_ACCESS_KEY,
  type PhiAccessConfig,
} from "./phi-access.decorator";
import { SKIP_PHI_ACCESS_KEY } from "./skip-phi-access.decorator";
import { ForbiddenException, InternalServerErrorException } from "@nestjs/common";

/**
 * Apply globally; controllers that touch PHI annotate their handlers with
 * @PhiAccess({ entityType, action, idsFrom }). After the response, this
 * interceptor batches a RecordAccessLog row per touched entity.
 *
 * Failures are swallowed inside RecordAccessService — never break the
 * user-facing response over an audit miss.
 */
@Injectable()
export class PhiAccessInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: RecordAccessService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const cfg = this.reflector.getAllAndOverride<PhiAccessConfig>(
      PHI_ACCESS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_PHI_ACCESS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!cfg && !skip) {
      const isDev = process.env.NODE_ENV !== "production";
      const msg = `Silent PHI access gap: handler ${ctx.getClass().name}.${ctx.getHandler().name} is missing @PhiAccess() or @SkipPhiAccess()`;
      
      if (isDev) {
        throw new InternalServerErrorException(msg);
      }
      // In prod, just log it so we don't break the app, but we should alert.
      console.error(msg);
      return next.handle();
    }

    if (skip || !cfg) return next.handle();

    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0] ??
      req.socket.remoteAddress ??
      undefined;
    const ua = req.headers["user-agent"] as string | undefined;

    return next.handle().pipe(
      tap((response) => {
        const ids = this.extractIds(cfg, req, response);
        if (ids.length === 0) return;
        void this.access.recordMany(
          ids.map((id) => ({
            actorUserId: req.user?.id ?? null,
            orgId: req.staff?.orgId ?? null,
            entityType: cfg.entityType,
            entityId: id,
            action: cfg.action,
            ip,
            userAgent: ua,
          })),
        );
      }),
    );
  }

  private extractIds(
    cfg: PhiAccessConfig,
    req: AuthedRequest,
    res: unknown,
  ): string[] {
    if (typeof cfg.idsFrom === "function") return cfg.idsFrom(res);
    if (cfg.idsFrom === "response") {
      if (Array.isArray(res)) {
        return res
          .map((r) => (r as { id?: string }).id)
          .filter((v): v is string => typeof v === "string");
      }
      const id = (res as { id?: string })?.id;
      return id ? [id] : [];
    }
    // Default: pull from :id route param.
    const id = (req.params as Record<string, string>)?.id;
    return id ? [id] : [];
  }
}
