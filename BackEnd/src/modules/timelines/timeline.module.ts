import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timelines } from '../entities/timeline.entity'; 
import { Images } from '../entities/image.entity';
import { MapLocations } from '../entities/map-location.entity';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Timelines, Images, MapLocations]),
  ],
  providers: [TimelineService],
  controllers: [TimelineController],
})
export class TimelineModule {}