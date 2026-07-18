import { Module } from "@nestjs/common";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";
import { StaffModule } from "../staff/staff.module";

@Module({
  imports: [StaffModule], // InvitationsService for the accept-invitation flow
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
