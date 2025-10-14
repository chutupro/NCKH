import { IsString, IsNumber, IsOptional, MinLength, MaxLength } from 'class-validator';

export class MapLocationUpdateDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  Name?: string;

  @IsNumber()
  @IsOptional()
  Latitude?: number;

  @IsNumber()
  @IsOptional()
  Longitude?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  Description?: string;

  @IsNumber()
  @IsOptional()
  TimelineID?: number;

  @IsNumber()
  @IsOptional()
  ArticleID?: number;
}