import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { ArticleModule } from './modules/articles/article.module';
import { TimelineModule } from './modules/timelines/timeline.module';

@Module({
  imports: [
    DatabaseModule,
    ArticleModule,
    TimelineModule,
  ],
})
export class AppModule {}
