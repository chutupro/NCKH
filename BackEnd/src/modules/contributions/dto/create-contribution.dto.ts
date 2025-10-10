import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateContributionDto {
  @IsInt()
  ArticleID: number;

  @IsInt()
  UserID: number;

  @IsString()
  Content: string;

  @IsString()
  @IsOptional()
  Status?: string;
}