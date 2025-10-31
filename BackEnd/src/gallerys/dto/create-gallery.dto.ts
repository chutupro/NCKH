import { IsOptional, IsString, MaxLength, IsInt, IsNumberString } from 'class-validator';

export class CreateGalleryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsNumberString()
  categoryId?: string; // accept numeric string (will be parsed in service)

  @IsOptional()
  @IsString()
  tags?: string; // comma separated

  @IsOptional()
  @IsNumberString()
  userId?: string;
}