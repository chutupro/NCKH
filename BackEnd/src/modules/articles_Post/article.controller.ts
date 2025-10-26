import { Controller, Get, Post, Body } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles_post')
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

  @Post()
  async create(@Body() dto: CreateArticleDto) {
    const article = await this.articleService.createArticle(dto);
    return {
      status: 'success',
      data: article,
    };
  }
}
