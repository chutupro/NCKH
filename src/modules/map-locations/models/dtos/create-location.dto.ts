import { IsNotEmpty, IsNumber, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Create location DTO
 */
export class CreateLocationDto {
  @ApiProperty({ example: 'Hanoi Opera House' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  readonly name!: string;

  @ApiProperty({ example: 21.028511 })
  @IsNumber()
  @IsNotEmpty()
  readonly latitude!: number;

  @ApiProperty({ example: 105.804817 })
  @IsNumber()
  @IsNotEmpty()
  readonly longitude!: number;

  @ApiPropertyOptional({ example: 'Historic building in Hanoi' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  readonly description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  readonly timelineId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  readonly articleId?: number;
}

