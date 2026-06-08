import { Module } from "@nestjs/common";
import { RosterController } from "./roster.controller";
import { RosterProcessor } from "./roster.processor";

@Module({
  controllers: [RosterController],
  providers: [RosterProcessor],
})
export class RosterModule {}
