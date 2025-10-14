import { IsString, IsNumber, IsOptional, MinLength, MaxLength } from 'class-validator';

export class MapLocationCreateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  Name: string;

  @IsNumber()
  Latitude: number;

  @IsNumber()
  Longitude: number;

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