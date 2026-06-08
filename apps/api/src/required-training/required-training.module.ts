import { Module } from "@nestjs/common";
import { RequiredTrainingController } from "./required-training.controller";
import { RequiredTrainingService } from "./required-training.service";
import { MaterializeProcessor } from "./materialize.processor";

@Module({
  controllers: [RequiredTrainingController],
  providers: [RequiredTrainingService, MaterializeProcessor],
})
export class RequiredTrainingModule {}
