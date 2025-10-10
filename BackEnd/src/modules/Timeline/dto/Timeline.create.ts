import { IsInt, IsOptional, IsString, IsDateString, Length } from 'class-validator';

export class TimelineCreateDto {
  /** Liên kết tới bài viết */
  @IsOptional()
  @IsInt({ message: 'ArticleID phải là số nguyên' })
  ArticleID?: number;

  /** Ngày diễn ra sự kiện */
  @IsOptional()
  @IsDateString({}, { message: 'EventDate phải là ngày hợp lệ (ISO format)' })
  EventDate?: string | Date;

  /** Mô tả sự kiện */
  @IsOptional()
  @IsString({ message: 'Description phải là chuỗi' })
  @Length(5, 500, { message: 'Description phải dài từ 5–500 ký tự' })
  Description?: string;
}
