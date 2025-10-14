import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './services/dashboard.service';
import { DashboardController } from './controllers/dashboard.controller';
import { User } from '../users/entities/user.entity';
import { Article } from '../articles/entities/article.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Analytics } from '../articles/entities/analytics.entity';

/**
 * Dashboard module
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, Article, Contribution, Analytics])],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}

