import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { Public } from '../../../core/decorators/public.decorator';

/**
 * Analytics controller
 */
@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get view count for article
   */
  @Public()
  @Get('articles/:id/views')
  @ApiOperation({ summary: 'Get article view count' })
  @ApiResponse({ status: 200, description: 'View count retrieved' })
  async getViewCount(@Param('id', ParseIntPipe) articleId: number) {
    const viewCount = await this.analyticsService.getViewCount({ articleId });
    return { articleId, viewCount };
  }

  /**
   * Get top viewed articles
   */
  @Public()
  @Get('top-articles')
  @ApiOperation({ summary: 'Get top viewed articles' })
  @ApiResponse({ status: 200, description: 'Top articles retrieved' })
  async getTopArticles(@Query('limit', ParseIntPipe) limit?: number) {
    return this.analyticsService.getTopArticles({ limit });
  }
}

