import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { OnboardingService } from "./onboarding.service";
import { InvitationsService } from "../staff/invitations.service";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { AcceptInvitationDto } from "./dto/accept-invitation.dto";



@Controller("onboarding")
export class OnboardingController {
  constructor(
    private readonly onboarding: OnboardingService,
    private readonly invitations: InvitationsService,
  ) {}

  @Post("organization")
  @SkipPhiAccess()
  async createOrganization(
    @Body() body: CreateOrganizationDto,
    @CurrentUser() user: { id: string } | undefined,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.onboarding.createOrganization(user.id, body);
  }

  @Post("accept-invitation")
  @SkipPhiAccess()
  async acceptInvitation(
    @Body() body: AcceptInvitationDto,
    @CurrentUser() user: { id: string; email: string } | undefined,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.invitations.accept(user, body.token);
  }
}
