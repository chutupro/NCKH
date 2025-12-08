import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateImageComparisonDto {
  @IsString()
  Title: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsInt()
  CategoryID?: number;

  @IsOptional()
  @IsString()
  Address?: string;
}
