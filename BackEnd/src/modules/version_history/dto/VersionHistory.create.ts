import { IsInt, IsOptional, IsString, IsDateString, Length } from 'class-validator';

export class VersionHistoryCreateDto {
  /** liên kết tới bài viết (nếu có) */
  @IsOptional()
  @IsInt({ message: 'ArticleID phải là số nguyên' })
  ArticleID?: number;

  /** user thực hiện thay đổi */
  @IsOptional()
  @IsInt({ message: 'UserID phải là số nguyên' })
  UserID?: number;

  /** mô tả thay đổi / diff / note */
  @IsString({ message: 'Changes phải là chuỗi' })
  @Length(5, 500, { message: 'Changes phải dài từ 5 đến 500 ký tự' })
  Changes: string;

  /** thời điểm (chuỗi ISO hoặc Date) */
  @IsOptional()
  @IsDateString({}, { message: 'CreatedAt phải là ngày hợp lệ (ISO format)' })
  CreatedAt?: string | Date;
}
