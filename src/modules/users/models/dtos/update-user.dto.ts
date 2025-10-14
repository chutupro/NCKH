import { IsString, IsNumber, IsOptional, MinLength, MaxLength } from 'class-validator';
import { IsSecureEmail } from '../../../../shared/validators';
import { ApiPropertyOptional } from '@nestjs/swagger';

const MIN_PASSWORD_LENGTH = 6;
const MAX_FULLNAME_LENGTH = 100;

/**
 * Update user DTO
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsSecureEmail({ message: 'Email không hợp lệ hoặc không an toàn' })
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsString()
  @IsOptional()
  @MinLength(MIN_PASSWORD_LENGTH)
  readonly password?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_FULLNAME_LENGTH)
  readonly fullName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  readonly roleId?: number;
}

