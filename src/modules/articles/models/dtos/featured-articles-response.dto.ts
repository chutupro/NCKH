import { ApiProperty } from '@nestjs/swagger';

/**
 * Featured article item DTO
 */
export class FeaturedArticleItem {
  @ApiProperty()
  readonly articleId!: number;

  @ApiProperty()
  readonly title!: string;

  @ApiProperty()
  readonly viewCount!: number;

  @ApiProperty()
  readonly thumbnailUrl!: string | null;

  @ApiProperty()
  readonly createdAt!: Date;
}

/**
 * Featured articles response DTO
 */
export class FeaturedArticlesResponseDto {
  @ApiProperty({ type: [FeaturedArticleItem] })
  readonly articles!: FeaturedArticleItem[];
}

