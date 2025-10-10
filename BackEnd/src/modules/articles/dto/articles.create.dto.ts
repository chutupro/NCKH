import { IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateArticleDto {
  @IsString({ message: 'Title phải là chuỗi' })
  @Length(3, 255, { message: 'Title phải từ 3 đến 255 ký tự' })
  Title: string;

  @IsOptional()
  @IsString({ message: 'Content phải là chuỗi nếu có' })
  Content?: string;

  @IsOptional()
  @IsString({ message: 'Language phải là chuỗi nếu có' })
  Language?: string;

  @IsOptional()
  @IsNumber({}, { message: 'UserID phải là số nếu có' })
  UserID?: number;
}
