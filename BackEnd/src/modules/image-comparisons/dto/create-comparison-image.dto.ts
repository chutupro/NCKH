import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateComparisonImageDto {
  @IsInt()
  ComparisonID: number;

  @IsString()
  ImagePath: string;

  @IsOptional()
  @IsInt()
  Year?: number;

  @IsOptional()
  @IsString()
  Caption?: string;

  @IsOptional()
  @IsInt()
  DisplayOrder?: number;
}
