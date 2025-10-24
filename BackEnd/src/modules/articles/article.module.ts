import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Articles } from '../entities/article.entity';
import { Images } from '../entities/image.entity';
import { Categories } from '../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Articles, Images, Categories])],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
