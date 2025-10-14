import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from '../entities/analytics.entity';

const TOP_ARTICLES_LIMIT = 10;

/**
 * Analytics service for tracking views
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
  ) {}

  /**
   * Increments view count for article
   */
  async incrementViewCount({ articleId }: { articleId: number }): Promise<void> {
    const analytics = await this.analyticsRepository.findOne({ where: { articleId } });
    if (analytics) {
      analytics.viewCount += 1;
      await this.analyticsRepository.save(analytics);
    } else {
      await this.createAnalyticsRecord({ articleId });
    }
  }

  /**
   * Gets view count for article
   */
  async getViewCount({ articleId }: { articleId: number }): Promise<number> {
    const analytics = await this.analyticsRepository.findOne({ where: { articleId } });
    return analytics?.viewCount || 0;
  }

  /**
   * Gets top viewed articles
   */
  async getTopArticles({ limit }: { limit?: number }) {
    const topLimit = limit || TOP_ARTICLES_LIMIT;
    return this.analyticsRepository.find({
      order: { viewCount: 'DESC' },
      take: topLimit,
      relations: ['article'],
    });
  }

  /**
   * Creates analytics record for new article
   */
  async createAnalyticsRecord({ articleId }: { articleId: number }): Promise<void> {
    const analytics = this.analyticsRepository.create({
      articleId,
      viewCount: 1,
    });
    await this.analyticsRepository.save(analytics);
  }
}

