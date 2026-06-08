import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { z } from "zod";
import { Jurisdiction } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator";
import { OnboardingService } from "./onboarding.service";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";
import { CreateOrganizationDto } from "./dto/create-organization.dto";



@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post("organization")
  @SkipPhiAccess()
  async createOrganization(
    @Body() body: CreateOrganizationDto,
    @CurrentUser() user: { id: string } | undefined,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.onboarding.createOrganization(user.id, body);
  }
}
