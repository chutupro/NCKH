import { Controller, Get } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getAll() {
    const articles = await this.articleService.getAllArticles();
    return {
      status: 'success',
      total: articles.length,
      data: articles,
    };
  }
}
