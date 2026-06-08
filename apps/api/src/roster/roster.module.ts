import { Module } from "@nestjs/common";
import { RosterController } from "./roster.controller";
import { RosterProcessor } from "./roster.processor";
import { StaffModule } from "../staff/staff.module";

@Module({
  imports: [StaffModule], // RosterProcessor uses InvitationsService
  controllers: [RosterController],
  providers: [RosterProcessor],
})
export class RosterModule {}
