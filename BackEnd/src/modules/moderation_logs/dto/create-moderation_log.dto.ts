import { IsInt, IsOptional, IsString, MaxLength, IsNotEmpty, MinLength } from 'class-validator';

export class CreateModerationLogDto {
  @IsInt({ message: 'ContributionID phải là số nguyên' })
  @IsNotEmpty({ message: 'ContributionID không được để trống' })
  ContributionID: number;

  @IsInt({ message: 'ModeratorID phải là số nguyên' })
  @IsNotEmpty({ message: 'ModeratorID không được để trống' })
  ModeratorID: number;

  @IsString({ message: 'Action phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Action phải có ít nhất 3 ký tự' })
  @MaxLength(255, { message: 'Action không được vượt quá 255 ký tự' })
  @IsNotEmpty({ message: 'Action không được để trống' })
  Action: string;

  @IsOptional()
  @IsString({ message: 'Reason phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Reason không được vượt quá 500 ký tự' })
  Reason?: string;
}