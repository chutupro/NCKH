import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
// import { ArticleModule } from './modules/articles/article.module';
import { TimelineModule } from './modules/timelines/timeline.module';
import { MapLocationsModule } from './modules/maplocations/map-locations.module';
import { register } from 'module';
import { AuthModule } from './modules/modules/auth/auth.module';
import { CompareModule } from './modules/Compare/Compare.module';
import { ArticleModule } from './modules/articles_Post/article-post.module'; 
import { CommentModule } from './modules/comments/comment.module';

@Module({
  imports: [
    DatabaseModule,
    // ArticleModule,
    TimelineModule,
    MapLocationsModule,
    CompareModule,
    AuthModule,
    ArticleModule,
    CommentModule,
  ],
})
export class AppModule {}
