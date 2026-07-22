import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { Public } from "../public.decorator";
import { SkipPhiAccess } from "../../audit/skip-phi-access.decorator";
import { AcademySsoService } from "./academy-sso.service";
import { SsoSignInDto } from "./dto/sso-sign-in.dto";

/**
 * Entry point for the ElderCare Academy handoff (Seam 1). Public — the
 * caller has no Academy session yet, only the one-time token ElderCare
 * minted. See docs/ELDERCARE_ACADEMY_SSO_PLAN.md.
 */
@Controller("auth")
export class AcademySsoController {
  constructor(private readonly sso: AcademySsoService) {}

  @Public()
  @Post("sso")
  @SkipPhiAccess()
  // Server-to-server from the web SSR route; generous cap guards a runaway loop
  // without limiting a shift-change burst of handoffs. The 256-bit single-use
  // 60s one-time token is the real anti-brute-force control.
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 100, ttl: 60_000 } })
  signIn(@Body() body: SsoSignInDto) {
    return this.sso.signIn(body.token);
  }
}
