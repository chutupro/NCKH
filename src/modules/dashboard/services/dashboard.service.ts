import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Article } from '../../articles/entities/article.entity';
import { Contribution } from '../../contributions/entities/contribution.entity';
import { Analytics } from '../../articles/entities/analytics.entity';

/**
 * Dashboard service for admin statistics
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Contribution)
    private readonly contributionRepository: Repository<Contribution>,
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
  ) {}

  /**
   * Gets dashboard statistics
   */
  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalArticles = await this.articleRepository.count();
    const pendingContributions = await this.contributionRepository.count({
      where: { status: 'Pending' },
    });
    const analyticsData = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('SUM(analytics.viewCount)', 'totalViews')
      .getRawOne();
    const totalViews = parseInt(analyticsData?.totalViews || '0');
    return {
      totalUsers,
      totalArticles,
      pendingContributions,
      totalViews,
    };
  }

  /**
   * Gets user statistics
   */
  async getUserStats() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select(['user.userId', 'user.email', 'user.fullName', 'user.createdAt', 'role.roleName'])
      .orderBy('user.createdAt', 'DESC')
      .take(10)
      .getMany();
    return users;
  }

  /**
   * Gets article statistics
   */
  async getArticleStats() {
    const recentArticles = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .leftJoinAndSelect('article.analytics', 'analytics')
      .orderBy('article.createdAt', 'DESC')
      .take(10)
      .getMany();
    return recentArticles;
  }
}

