import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseModule } from './common/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ModerationLogsModule } from './modules/moderation_logs/moderation_logs.module';
import { contributionsModule } from './modules/contributions/contributions.module';
import { MapLocationModule } from './modules/MapLocations/MapLocations.Module';
import { ImageComparisonModule } from './modules/ImageComparisons/ImageComparisons.Module';

@Module({
  imports: [
    databaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ModerationLogsModule,
    contributionsModule,
    MapLocationModule,
    ImageComparisonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
}
