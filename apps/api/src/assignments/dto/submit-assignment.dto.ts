import { IsArray, IsInt, IsString, ValidateNested, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class AssignmentResponseDto {
  @IsString()
  questionId: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(20, { each: true })
  selectedIdx: number[];
}

export class SubmitAssignmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentResponseDto)
  responses: AssignmentResponseDto[];
}
