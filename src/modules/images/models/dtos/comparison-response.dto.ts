import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Image comparison response DTO
 */
export class ComparisonResponseDto {
  @ApiProperty()
  readonly comparisonId!: number;

  @ApiPropertyOptional()
  readonly historicalImageId!: number | null;

  @ApiPropertyOptional()
  readonly modernImageId!: number | null;

  @ApiPropertyOptional()
  readonly articleId!: number | null;

  @ApiPropertyOptional()
  readonly description!: string | null;

  @ApiPropertyOptional()
  readonly historicalImagePath!: string | null;

  @ApiPropertyOptional()
  readonly modernImagePath!: string | null;
}

