import { IsNotEmpty, IsString, IsNumber, MinLength, MaxLength } from 'class-validator';
import { IsSecureEmail } from '../../../../shared/validators';
import { ApiProperty } from '@nestjs/swagger';

const MIN_PASSWORD_LENGTH = 6;
const MAX_FULLNAME_LENGTH = 100;

/**
 * Create user DTO
 */
export class CreateUserDto {
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

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly roleId!: number;
}

