import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationImage } from '../entities/location-image.entity';
import { MapLocations } from '../entities/map-location.entity';
import { LocationImagesService } from './location-images.service';
import { LocationImagesController } from './location-images.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LocationImage, MapLocations])],
  controllers: [LocationImagesController],
  providers: [LocationImagesService],
  exports: [LocationImagesService],
})
export class LocationImagesModule {}



