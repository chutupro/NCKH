import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { Images } from 'src/modules/entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Images])],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}