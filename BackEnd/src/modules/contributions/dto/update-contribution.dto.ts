import { IsInt, IsString, IsOptional } from 'class-validator';

export class UpdateContributionDto {
  @IsInt()
  @IsOptional()
  ArticleID?: number;

  @IsInt()
  @IsOptional()
  UserID?: number;

  @IsString()
  @IsOptional()
  Content?: string;

  @IsString()
  @IsOptional()
  Status?: string;
}