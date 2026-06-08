import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Jurisdiction } from "@prisma/client";

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsEnum(Jurisdiction)
  jurisdiction: Jurisdiction;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  siteName: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  siteAddress?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  regulatorLicenseNumber?: string;
}
