import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGalleryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  AltText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  Type?: string;
}
