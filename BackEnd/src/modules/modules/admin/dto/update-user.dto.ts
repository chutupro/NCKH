import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNumber()
  roleId?: number;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'locked'])
  status?: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
