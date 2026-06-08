import { Module } from "@nestjs/common";
import { StaffController } from "./staff.controller";
import { StaffService } from "./staff.service";
import { InvitationsService } from "./invitations.service";

@Module({
  controllers: [StaffController],
  providers: [StaffService, InvitationsService],
  exports: [InvitationsService],
})
export class StaffModule {}
