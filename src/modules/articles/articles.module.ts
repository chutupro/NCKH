import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './services/articles.service';
import { AnalyticsService } from './services/analytics.service';
import { VersionHistoryService } from './services/version-history.service';
import { ArticlesController } from './controllers/articles.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { Article } from './entities/article.entity';
import { Analytics } from './entities/analytics.entity';
import { VersionHistory } from './entities/version-history.entity';

/**
 * Articles module
 */
@Module({
  imports: [TypeOrmModule.forFeature([Article, Analytics, VersionHistory])],
  providers: [ArticlesService, AnalyticsService, VersionHistoryService],
  controllers: [ArticlesController, AnalyticsController],
  exports: [ArticlesService, AnalyticsService, VersionHistoryService],
})
export class ArticlesModule {}

