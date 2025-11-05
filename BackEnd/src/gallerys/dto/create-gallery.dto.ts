import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumberString,
} from 'class-validator';

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
  categoryId?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsNumberString()
  userId?: string;

  @IsOptional()
  @IsNumberString()
  articleId?: string;
}
