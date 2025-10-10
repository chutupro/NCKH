import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional() // Make email optional for updates
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional() // Make password optional for updates
  password?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  fullName?: string;
}
