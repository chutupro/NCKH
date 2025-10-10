import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class ImageCreateDto {
  @IsUrl({}, { message: 'Url phải là đường dẫn hợp lệ (http, https, ...)' })
  Url: string;

  @IsOptional()
  @IsString({ message: 'Caption phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Caption tối đa 255 ký tự' })
  Caption?: string;

  @IsOptional()
  @IsInt({ message: 'ArticleID phải là số nguyên' })
  ArticleID?: number;

  @IsOptional()
  @IsInt({ message: 'UserID phải là số nguyên' })
  UserID?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Width phải là số' })
  @Min(1, { message: 'Width phải lớn hơn 0' })
  Width?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Height phải là số' })
  @Min(1, { message: 'Height phải lớn hơn 0' })
  Height?: number;
}
