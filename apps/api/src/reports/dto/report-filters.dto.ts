import { IsOptional, IsString, IsDateString } from "class-validator";

export class ReportFiltersDto {
  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  module?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
