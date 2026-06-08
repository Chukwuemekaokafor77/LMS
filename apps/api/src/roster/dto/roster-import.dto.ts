import { IsString, MinLength, MaxLength } from "class-validator";

export class StartRosterImportDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  filename: string;
}

export class CommitRosterImportDto {
  @IsString()
  importId: string;
}
