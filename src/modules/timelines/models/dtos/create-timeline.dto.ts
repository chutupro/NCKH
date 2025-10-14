import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Create timeline DTO
 */
export class CreateTimelineDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly articleId!: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  readonly eventDate!: string;

  @ApiProperty({ example: 'Historical event occurred' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  readonly description!: string;

  @ApiPropertyOptional({ example: 21.028511 })
  @IsNumber()
  @IsOptional()
  readonly latitude?: number;

  @ApiPropertyOptional({ example: 105.804817 })
  @IsNumber()
  @IsOptional()
  readonly longitude?: number;
}

