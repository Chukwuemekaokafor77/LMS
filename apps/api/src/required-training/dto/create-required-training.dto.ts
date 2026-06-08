import { IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";
import { TrainingCadence } from "@prisma/client";

export class CreateRequiredTrainingDto {
  @IsString()
  @MinLength(1)
  roleCode: string;

  @IsString()
  moduleId: string;

  @IsEnum(TrainingCadence)
  cadence: TrainingCadence;

  @IsInt()
  @Min(0)
  @Max(365)
  @IsOptional()
  graceDays?: number;

  @IsString()
  @IsOptional()
  siteId?: string | null;
}
