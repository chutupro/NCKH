import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collections } from '../entities/collection.entity';
import { CollectionArticles } from '../entities/collection-article.entity';
import { Articles } from '../entities/article.entity';
import { Images } from '../entities/image.entity';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collections, CollectionArticles, Articles, Images])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
