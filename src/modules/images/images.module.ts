import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './services/images.service';
import { ImageComparisonsService } from './services/image-comparisons.service';
import { PhotoAnnotationsService } from './services/photo-annotations.service';
import { ImagesController } from './controllers/images.controller';
import { ImageComparisonsController } from './controllers/image-comparisons.controller';
import { Image } from './entities/image.entity';
import { ImageComparison } from './entities/image-comparison.entity';
import { PhotoAnnotation } from './entities/photo-annotation.entity';

/**
 * Images module
 */
@Module({
  imports: [TypeOrmModule.forFeature([Image, ImageComparison, PhotoAnnotation])],
  providers: [ImagesService, ImageComparisonsService, PhotoAnnotationsService],
  controllers: [ImagesController, ImageComparisonsController],
  exports: [ImagesService, ImageComparisonsService, PhotoAnnotationsService],
})
export class ImagesModule {}

