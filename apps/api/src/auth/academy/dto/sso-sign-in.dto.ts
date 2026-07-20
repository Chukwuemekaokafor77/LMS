import { IsString, MinLength } from "class-validator";

export class SsoSignInDto {
  @IsString()
  @MinLength(16)
  token: string;
}
