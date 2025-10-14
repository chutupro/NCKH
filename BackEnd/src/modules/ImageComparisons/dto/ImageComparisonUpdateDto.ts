import { IsNumber, IsString, IsOptional, MaxLength } from 'class-validator';

export class ImageComparisonUpdateDto {
  @IsNumber()
  @IsOptional()
  HistoricalImageID?: number;

  @IsNumber()
  @IsOptional()
  ModernImageID?: number;

  @IsNumber()
  @IsOptional()
  ArticleID?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  Description?: string;
}