import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateAnalyticsDto {
  @IsInt({ message: 'ArticleID phải là số nguyên' })
  ArticleID: number;

  @IsInt({ message: 'ViewCount phải là số nguyên' })
  @Min(0, { message: 'ViewCount phải là số không âm' })
  @IsOptional()
  ViewCount?: number;
}