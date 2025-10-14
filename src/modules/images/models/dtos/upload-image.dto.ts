import { IsNotEmpty, IsNumber, IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MAX_ALTTEXT_LENGTH = 200;
const MAX_TYPE_LENGTH = 20;
const MAX_LOCATION_LENGTH = 100;

/**
 * Upload image DTO
 */
export class UploadImageDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly articleId!: number;

  @ApiPropertyOptional({ example: 'Historical photo of Hanoi' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_ALTTEXT_LENGTH)
  readonly altText?: string;

  @ApiProperty({ example: 'historical' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TYPE_LENGTH)
  readonly type!: string;

  @ApiPropertyOptional({ example: '2023-01-01' })
  @IsDateString()
  @IsOptional()
  readonly captureDate?: string;

  @ApiPropertyOptional({ example: 'Hanoi, Vietnam' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_LOCATION_LENGTH)
  readonly location?: string;
}

