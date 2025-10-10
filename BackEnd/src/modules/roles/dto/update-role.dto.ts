import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
