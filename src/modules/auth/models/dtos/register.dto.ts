import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { IsSecureEmail } from '../../../../shared/validators';
import { ApiProperty } from '@nestjs/swagger';

const MIN_PASSWORD_LENGTH = 6;
const MAX_FULLNAME_LENGTH = 100;

/**
 * Register DTO
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsSecureEmail({ message: 'Email không hợp lệ hoặc không an toàn' })
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_PASSWORD_LENGTH)
  readonly password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_FULLNAME_LENGTH)
  readonly fullName!: string;
}

