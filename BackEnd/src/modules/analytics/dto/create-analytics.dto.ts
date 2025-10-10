import { IsInt, IsOptional } from 'class-validator';

export class CreateAnalyticsDto {
  @IsInt()
  ArticleID: number;

  @IsInt()
  @IsOptional()
  ViewCount?: number;
}