import { Controller, Get, Post, Body, Put } from '@nestjs/common';
import { ArticleService } from './article-post.service'; 
import { CreateArticleDto } from './dto/create-article.dto';
import { Param, Delete } from '@nestjs/common';
import { ApiParam, ApiBody } from '@nestjs/swagger';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles_post')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // --- GET ALL ARTICLES ---
  @Get()
  async getAll() {
    const articles = await this.articleService.getAllArticles();
    return articles;
  }
  // --- CREATE NEW ARTICLE ---
  @Post()
  async create(@Body() dto: CreateArticleDto) {
    const article = await this.articleService.createArticle(dto);
    return article;
  }

  // --- DELETE ARTICLE BY ID ---
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.articleService.deleteArticle(id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: Number, description: 'ID of the article to update' })
  @ApiBody({ type: UpdateArticleDto })
  async update(@Param('id') id: number, @Body() dto: UpdateArticleDto) {
    return this.articleService.updateArticle(id, dto);
}
}