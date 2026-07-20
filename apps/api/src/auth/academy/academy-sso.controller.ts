import { Body, Controller, Post } from "@nestjs/common";
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
  signIn(@Body() body: SsoSignInDto) {
    return this.sso.signIn(body.token);
  }
}
