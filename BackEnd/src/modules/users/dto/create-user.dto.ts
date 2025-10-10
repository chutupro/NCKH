import { IsEmail, IsString, MinLength, MaxLength, IsInt, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsInt()
  @IsOptional()
  roleId?: number;
}
