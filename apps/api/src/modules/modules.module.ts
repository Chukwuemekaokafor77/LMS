import { Module } from "@nestjs/common";
import { ModulesController } from "./modules.controller";
import { ModulesService } from "./modules.service";
import { LessonsController } from "./lessons.controller";
import { LessonProgressService } from "./lesson-progress.service";

@Module({
  controllers: [ModulesController, LessonsController],
  providers: [ModulesService, LessonProgressService],
})
export class ModulesModule {}
