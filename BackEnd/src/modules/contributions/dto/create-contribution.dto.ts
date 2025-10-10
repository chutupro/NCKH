import { IsInt, IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateContributionDto {
  @IsInt({ message: 'ArticleID phải là số nguyên' })
  ArticleID: number;

  @IsInt({ message: 'UserID phải là số nguyên' })
  UserID: number;

  @IsString({ message: 'Content phải là chuỗi' })
  Content: string;

  @IsString({ message: 'Status phải là chuỗi' })
  @MaxLength(20, { message: 'Status không được vượt quá 20 ký tự' })
  @IsOptional()
  @IsIn(['Pending', 'Approved', 'Rejected'], { message: 'Status phải là một trong: Pending, Approved, Rejected' })
  Status?: string;
}