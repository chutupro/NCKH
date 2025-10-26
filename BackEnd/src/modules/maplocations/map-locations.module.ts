// map-locations.module.ts
import { Module } from '@nestjs/common';
import { MapLocationsController } from './map-locations.controller';
import { MapLocationsService } from './map-locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapLocations } from '../entities/map-location.entity';
import { Timelines } from '../entities/timeline.entity';
import { Articles } from '../entities/article.entity';
import { Feedback } from '../entities/feedback.entity'; // Thêm Feedback entity
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([MapLocations, Timelines, Articles, Feedback]), // Thêm Feedback
    MulterModule.register({
      dest: './uploads/',
    }),
  ],
  controllers: [MapLocationsController],
  providers: [MapLocationsService],
})
export class MapLocationsModule {}