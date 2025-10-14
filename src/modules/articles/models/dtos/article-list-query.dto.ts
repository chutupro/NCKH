import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const MIN_PAGE = 1;
const MIN_LIMIT = 1;

/**
 * Article list query DTO
 */
export class ArticleListQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_PAGE)
  readonly page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_LIMIT)
  readonly limit?: number = 10;

  @ApiPropertyOptional({ example: 'history' })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  readonly language?: string;

  @ApiPropertyOptional({ example: 'viewCount' })
  @IsOptional()
  @IsString()
  readonly sortBy?: string;

  @ApiPropertyOptional({ example: 'DESC' })
  @IsOptional()
  @IsString()
  readonly sortOrder?: 'ASC' | 'DESC';
}

