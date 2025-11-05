import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { Images } from 'src/modules/entities/image.entity';
import { Articles } from 'src/modules/entities/article.entity';
import { Categories } from 'src/modules/entities/category.entity';
import { Likes } from 'src/modules/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Images, Articles, Categories, Likes])],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
