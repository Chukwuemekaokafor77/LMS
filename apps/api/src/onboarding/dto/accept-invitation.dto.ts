import { IsString, MaxLength, MinLength } from "class-validator";

export class AcceptInvitationDto {
  @IsString()
  @MinLength(16)
  @MaxLength(128)
  token: string;
}
