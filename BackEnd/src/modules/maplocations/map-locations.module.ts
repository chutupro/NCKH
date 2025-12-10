// map-locations.module.ts
import { Module } from '@nestjs/common';
import { MapLocationsController } from './map-locations.controller';
import { MapLocationsService } from './map-locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapLocations } from '../entities/map-location.entity';
import { Timelines } from '../entities/timeline.entity';
import { Articles } from '../entities/article.entity';
import { Feedback } from '../entities/feedback.entity';
import { Images } from '../entities/image.entity';
import { MediaClientService } from 'src/common/media-client.service';
import { ImagesService } from 'src/common/images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MapLocations, Timelines, Articles, Feedback, Images]),
  ],
  controllers: [MapLocationsController],
  providers: [MapLocationsService, MediaClientService, ImagesService],
})
export class MapLocationsModule {}