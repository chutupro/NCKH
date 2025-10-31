import { IsOptional, IsString, MaxLength, IsNumberString } from 'class-validator';

export class UpdateGalleryDto {
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
  categoryId?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}