import {  Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { ArticleModule } from './modules/articles/article.module'; 


@Module({
  imports: [
    DatabaseModule,
    ArticleModule,
  ],
})
export class AppModule {
  
}
