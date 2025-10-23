import {  Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { ArticleModule } from './modules/articles/article.module'; 
import { TimelineService } from './modules/timelines/timeline.service';


@Module({
  imports: [
    DatabaseModule,
    ArticleModule,
    TimelineService,
  ],
})
export class AppModule {
  
}
