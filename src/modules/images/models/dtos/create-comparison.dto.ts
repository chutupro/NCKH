import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Create image comparison DTO
 */
export class CreateComparisonDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  readonly historicalImageId?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  readonly modernImageId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  readonly articleId?: number;

  @ApiPropertyOptional({ example: 'Then and now comparison' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  readonly description?: string;
}

