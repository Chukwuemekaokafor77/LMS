import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ModuleStatus } from "@prisma/client";

export class CreateModuleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  titleEn: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  titleFr: string;

  @IsString()
  @MaxLength(2000)
  descriptionEn: string;

  @IsString()
  @MaxLength(2000)
  descriptionFr: string;

  @IsInt()
  @Min(1)
  @Max(600)
  durationMin: number;
}

export class UpdateModuleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  titleEn?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  titleFr?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  descriptionEn?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  descriptionFr?: string;

  @IsInt()
  @Min(1)
  @Max(600)
  @IsOptional()
  durationMin?: number;

  @IsEnum(ModuleStatus)
  @IsOptional()
  status?: ModuleStatus;
}

export class CreateLessonDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  titleEn: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  titleFr: string;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;
}

export class UpdateLessonDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  titleEn?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  titleFr?: string;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;
}

export class ReorderLessonsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  lessonIds: string[];
}

export class QuizQuestionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  promptEn: string;

  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  promptFr: string;

  @IsEnum(["SINGLE", "MULTIPLE", "TRUE_FALSE"])
  type: "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  choicesEn: string[];

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  choicesFr: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(19, { each: true })
  correctIdx: number[];

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  explainEn?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  explainFr?: string;
}

export class UpsertQuizDto {
  @IsInt()
  @Min(1)
  @Max(100)
  passMark: number;

  @IsBoolean()
  @IsOptional()
  randomize?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}
