import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MAX_ROLENAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;

/**
 * Create role DTO
 */
export class CreateRoleDto {
  @ApiProperty({ example: 'Editor' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ROLENAME_LENGTH)
  readonly roleName!: string;

  @ApiPropertyOptional({ example: 'Can edit articles' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  readonly description?: string;
}

