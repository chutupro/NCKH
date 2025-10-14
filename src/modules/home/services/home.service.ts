import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../articles/services/analytics.service';
import { ImageComparisonsService } from '../../images/services/image-comparisons.service';
import { TimelinesService } from '../../timelines/services/timelines.service';

const FEATURED_LIMIT = 5;

/**
 * Home page service
 */
@Injectable()
export class HomeService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly comparisonsService: ImageComparisonsService,
    private readonly timelinesService: TimelinesService,
  ) {}

  /**
   * Gets home page data
   */
  async getHomePageData() {
    const topArticles = await this.analyticsService.getTopArticles({ limit: FEATURED_LIMIT });
    const featuredComparisons = await this.comparisonsService.getFeaturedComparisons({ limit: FEATURED_LIMIT });
    const recentTimelines = await this.timelinesService.getAllTimelines();
    const stats = {
      totalViews: topArticles.reduce((sum, item) => sum + item.viewCount, 0),
      featuredArticlesCount: topArticles.length,
      comparisonsCount: featuredComparisons.length,
    };
    return {
      featuredArticles: topArticles,
      featuredComparisons,
      recentTimelines: recentTimelines.slice(0, FEATURED_LIMIT),
      stats,
    };
  }
}

