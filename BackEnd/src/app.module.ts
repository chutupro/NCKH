import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { ArticleModule } from './modules/articles/article.module';
import { TimelineModule } from './modules/timelines/timeline.module';
import { CompareModule } from './modules/Compare/Compare.module'; 

@Module({
  imports: [
    DatabaseModule,
    ArticleModule,
    TimelineModule,
    CompareModule, 
  ],
})
export class AppModule {}
