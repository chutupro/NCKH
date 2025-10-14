import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MIN_RATING = 0;
const MAX_RATING = 5;
const MAX_COMMENT_LENGTH = 1000;

/**
 * Create feedback DTO
 */
export class CreateFeedbackDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly articleId!: number;

  @ApiPropertyOptional({ example: 'Great article!' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_COMMENT_LENGTH)
  readonly comment?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  readonly rating?: number;
}

