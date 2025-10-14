import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ArticlesService } from '../services/articles.service';
import { AnalyticsService } from '../services/analytics.service';
import { VersionHistoryService } from '../services/version-history.service';
import { CreateArticleDto } from '../models/dtos/create-article.dto';
import { UpdateArticleDto } from '../models/dtos/update-article.dto';
import { ArticleListQueryDto } from '../models/dtos/article-list-query.dto';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { Public } from '../../../core/decorators/public.decorator';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Articles controller
 */
@ApiTags('Articles')
@ApiBearerAuth()
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly analyticsService: AnalyticsService,
    private readonly versionHistoryService: VersionHistoryService,
  ) {}

  /**
   * Create article
   */
  @Post()
  @ApiOperation({ summary: 'Create new article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: { userId: number },
  ) {
    return this.articlesService.createArticle({ userId: user.userId, createArticleDto });
  }

  /**
   * Get all articles with filters
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  async getArticles(@Query() query: ArticleListQueryDto) {
    return this.articlesService.getArticles(query);
  }

  /**
   * Get article by ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getArticleById(@Param('id', ParseIntPipe) articleId: number) {
    await this.analyticsService.incrementViewCount({ articleId });
    return this.articlesService.getArticleById({ articleId });
  }

  /**
   * Update article
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async updateArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: { userId: number; role: string },
  ) {
    return this.articlesService.updateArticle({
      articleId,
      userId: user.userId,
      userRole: user.role,
      updateArticleDto,
    });
  }

  /**
   * Delete article
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete article' })
  @ApiResponse({ status: 200, description: 'Article deleted successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async deleteArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @CurrentUser() user: { userId: number; role: string },
  ) {
    await this.articlesService.deleteArticle({ articleId, userId: user.userId, userRole: user.role });
    return { message: 'Article deleted successfully' };
  }

  /**
   * Get article version history
   */
  @Get(':id/versions')
  @ApiOperation({ summary: 'Get article version history' })
  @ApiResponse({ status: 200, description: 'Version history retrieved' })
  async getArticleVersions(@Param('id', ParseIntPipe) articleId: number) {
    return this.versionHistoryService.getArticleVersions({ articleId });
  }

  /**
   * Smoke test endpoint for admin
   */
  @Get('admin/test')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Admin smoke test' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return { message: 'Articles admin test successful' };
  }
}

