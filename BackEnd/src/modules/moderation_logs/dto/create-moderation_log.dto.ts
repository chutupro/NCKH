import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateModerationLogDto {
  @IsInt()
  ContributionID: number;

  @IsInt()
  ModeratorID: number;

  @IsString()
  @MaxLength(255)
  Action: string;

  @IsOptional()
  @IsString()
  Reason?: string;
}