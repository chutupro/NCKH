import { IsInt, IsOptional } from 'class-validator';

export class UpdateAnalyticsDto {
  @IsInt()
  @IsOptional()
  ArticleID?: number;

  @IsInt()
  @IsOptional()
  ViewCount?: number;
}