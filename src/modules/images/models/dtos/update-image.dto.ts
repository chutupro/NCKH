import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const MAX_ALTTEXT_LENGTH = 200;
const MAX_TYPE_LENGTH = 20;
const MAX_LOCATION_LENGTH = 100;

/**
 * Update image DTO
 */
export class UpdateImageDto {
  @ApiPropertyOptional({ example: 'Updated alt text' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_ALTTEXT_LENGTH)
  readonly altText?: string;

  @ApiPropertyOptional({ example: 'modern' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_TYPE_LENGTH)
  readonly type?: string;

  @ApiPropertyOptional({ example: '2023-12-01' })
  @IsDateString()
  @IsOptional()
  readonly captureDate?: string;

  @ApiPropertyOptional({ example: 'Ho Chi Minh City' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_LOCATION_LENGTH)
  readonly location?: string;
}

