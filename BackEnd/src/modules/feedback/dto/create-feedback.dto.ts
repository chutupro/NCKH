import { IsInt, IsString, MaxLength, IsOptional, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt({ message: 'ArticleID phải là số nguyên' })
  ArticleID: number;

  @IsInt({ message: 'UserID phải là số nguyên' })
  UserID: number;

  @IsString({ message: 'Comment phải là chuỗi' })
  @MaxLength(500, { message: 'Comment không được vượt quá 500 ký tự' })
  @IsOptional()
  Comment?: string;

  @IsInt({ message: 'Rating phải là số nguyên' })
  @Min(0, { message: 'Rating phải từ 0 đến 5' })
  @Max(5, { message: 'Rating phải từ 0 đến 5' })
  Rating: number;
}