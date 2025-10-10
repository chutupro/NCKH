import { IsInt, IsOptional, Min, IsDate } from 'class-validator';

export class UpdateAnalyticsDto {
  @IsInt({ message: 'ArticleID phải là số nguyên' })
  @IsOptional()
  ArticleID?: number;

  @IsInt({ message: 'ViewCount phải là số nguyên' })
  @Min(0, { message: 'ViewCount phải là số không âm' })
  @IsOptional()
  ViewCount?: number;

  @IsDate({ message: 'UpdatedAt phải là ngày hợp lệ' })
  @IsOptional()
  UpdatedAt?: Date;
}