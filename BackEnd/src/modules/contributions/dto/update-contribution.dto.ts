import { IsInt, IsString, MaxLength, IsOptional, IsIn, IsDate } from 'class-validator';

export class UpdateContributionDto {
  @IsInt({ message: 'ArticleID phải là số nguyên' })
  @IsOptional()
  ArticleID?: number;

  @IsInt({ message: 'UserID phải là số nguyên' })
  @IsOptional()
  UserID?: number;

  @IsString({ message: 'Content phải là chuỗi' })
  @IsOptional()
  Content?: string;

  @IsString({ message: 'Status phải là chuỗi' })
  @MaxLength(20, { message: 'Status không được vượt quá 20 ký tự' })
  @IsOptional()
  @IsIn(['Pending', 'Approved', 'Rejected'], { message: 'Status phải là một trong: Pending, Approved, Rejected' })
  Status?: string;

  @IsDate({ message: 'SubmittedAt phải là ngày hợp lệ' })
  @IsOptional()
  SubmittedAt?: Date;
}