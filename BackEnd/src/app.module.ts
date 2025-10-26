import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { ArticleModule } from './modules/articles_Post/article.module';
import { TimelineModule } from './modules/timelines/timeline.module';
import { CommentModule } from './modules/comments/comment.module';

@Module({
  imports: [
    DatabaseModule,
    ArticleModule,
    TimelineModule,
    CommentModule
  ],
})
export class AppModule {}
