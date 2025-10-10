import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  roleName: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
