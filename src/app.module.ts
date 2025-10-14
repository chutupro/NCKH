import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { ImagesModule } from './modules/images/images.module';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { TimelinesModule } from './modules/timelines/timelines.module';
import { MapLocationsModule } from './modules/map-locations/map-locations.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HomeModule } from './modules/home/home.module';

/**
 * Root application module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CoreModule,
    SharedModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ArticlesModule,
    ImagesModule,
    ContributionsModule,
    FeedbackModule,
    TimelinesModule,
    MapLocationsModule,
    DashboardModule,
    HomeModule,
  ],
})
export class AppModule {}

