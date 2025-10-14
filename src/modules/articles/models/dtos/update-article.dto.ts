import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const MAX_TITLE_LENGTH = 200;
const MAX_LANGUAGE_LENGTH = 10;

/**
 * Update article DTO
 */
export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_TITLE_LENGTH)
  readonly title?: string;

  @ApiPropertyOptional({ example: 'Updated content...' })
  @IsString()
  @IsOptional()
  readonly content?: string;

  @ApiPropertyOptional({ example: 'vi' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_LANGUAGE_LENGTH)
  readonly language?: string;
}

