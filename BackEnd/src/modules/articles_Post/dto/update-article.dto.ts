// src/articles/dto/update-article.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiPropertyOptional({ description: 'Title of the article' })
  title?: string;

  @ApiPropertyOptional({ description: 'Content of the article' })
  content?: string;

  @ApiPropertyOptional({ description: 'ID of the category' })
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Path of the article image' })
  imagePath?: string;

  @ApiPropertyOptional({ description: 'Description (alt text) of the image' })
  imageDescription?: string;
}
