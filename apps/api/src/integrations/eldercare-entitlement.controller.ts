import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { Public } from "../auth/public.decorator";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";
import { EldercareEntitlementService } from "./eldercare-entitlement.service";
import { verifyServiceHmac } from "./service-hmac";

/**
 * Inbound ElderCare → Academy entitlement webhook (Seam 3 direction reversed).
 * Same HMAC service auth as the SSO exchange and the certificate flow-back, but
 * this side *verifies*: signature = HMAC-SHA256(ACADEMY_EXCHANGE_SECRET,
 * "<unix-ts>.<raw-body>"). Public (no user session) — trust is the shared
 * secret. Reads the raw body (like the Mux webhook) so the signature matches
 * byte-for-byte.
 */
@Controller()
export class EldercareEntitlementController {
  private readonly log = new Logger(EldercareEntitlementController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly entitlements: EldercareEntitlementService,
  ) {}

  @Public()
  @Post("webhooks/eldercare/entitlement")
  @SkipPhiAccess()
  @HttpCode(200)
  async entitlement(
    @Req() req: Request,
    @Headers("x-academy-timestamp") timestamp: string | undefined,
    @Headers("x-academy-signature") signature: string | undefined,
  ) {
    const secret = this.config.get<string>("ACADEMY_EXCHANGE_SECRET");
    if (!secret) {
      throw new ServiceUnavailableException("ElderCare integration is not configured");
    }
    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!rawBody) throw new BadRequestException("Missing raw body");

    if (!verifyServiceHmac({ secret, timestamp, signature, rawBody })) {
      this.log.warn("Entitlement webhook: bad signature");
      throw new UnauthorizedException("Invalid signature");
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      throw new BadRequestException("Invalid JSON");
    }

    return this.entitlements.apply(payload as Parameters<EldercareEntitlementService["apply"]>[0]);
  }
}
