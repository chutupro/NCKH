import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationImage } from '../entities/location-image.entity';
import { MapLocations } from '../entities/map-location.entity';
import { Images } from '../entities/image.entity';
import { LocationImagesService } from './location-images.service';
import { LocationImagesController } from './location-images.controller';
import { MediaClientService } from 'src/common/media-client.service';
import { ImagesService } from 'src/common/images.service';

@Module({
  imports: [TypeOrmModule.forFeature([LocationImage, MapLocations, Images])],
  controllers: [LocationImagesController],
  providers: [LocationImagesService, MediaClientService, ImagesService],
  exports: [LocationImagesService],
})
export class LocationImagesModule {}



