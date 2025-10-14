import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Article response DTO
 */
export class ArticleResponseDto {
  @ApiProperty()
  readonly articleId!: number;

  @ApiProperty()
  readonly title!: string;

  @ApiProperty()
  readonly content!: string;

  @ApiProperty()
  readonly language!: string;

  @ApiProperty()
  readonly authorName!: string;

  @ApiProperty()
  readonly authorId!: number;

  @ApiProperty()
  readonly viewCount!: number;

  @ApiProperty()
  readonly createdAt!: Date;

  @ApiPropertyOptional()
  readonly updatedAt!: Date | null;
}

