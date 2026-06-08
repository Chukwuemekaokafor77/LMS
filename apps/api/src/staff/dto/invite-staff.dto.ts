import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { OrgPermission } from "@prisma/client";

export class InviteStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  roleCode: string;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsEnum(["STAFF", "SITE_ADMIN", "ORG_ADMIN"])
  @IsOptional()
  orgPermission?: OrgPermission;

  @IsEnum(["FT", "PT", "CASUAL"])
  @IsOptional()
  employmentType?: string;
}
