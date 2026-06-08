import { Module } from "@nestjs/common";
import { EmailProcessor } from "./email.processor";
import { EmailSender } from "./email.sender";

@Module({
  providers: [EmailSender, EmailProcessor],
  exports: [EmailSender],
})
export class EmailModule {}
