import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Create location event DTO
 */
export class CreateEventDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly locationId!: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  readonly eventDate!: string;

  @ApiProperty({ example: 'Cultural Festival' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TITLE_LENGTH)
  readonly eventTitle!: string;

  @ApiPropertyOptional({ example: 'Annual cultural festival' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  readonly eventDescription?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  readonly articleId?: number;
}

