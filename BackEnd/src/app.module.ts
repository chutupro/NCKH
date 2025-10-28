import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { ArticleModule } from './modules/articles/article.module';
import { TimelineModule } from './modules/timelines/timeline.module';
import { MapLocationsModule } from './modules/maplocations/map-locations.module';

@Module({
  imports: [
    DatabaseModule,
    ArticleModule,
    TimelineModule,
    MapLocationsModule
  ],
})
export class AppModule {}
