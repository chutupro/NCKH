import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsSecureEmail } from '../../../../shared/validators';
import { ApiProperty } from '@nestjs/swagger';

const MIN_PASSWORD_LENGTH = 6;

/**
 * Login DTO
 */
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsSecureEmail({ message: 'Email không hợp lệ hoặc không an toàn' })
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_PASSWORD_LENGTH)
  readonly password!: string;
}

