import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timelines } from '../entities/timeline.entity'; 
import { Images } from '../entities/image.entity'; 
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Timelines, Images]), // import entity để dùng Repository
  ],
  providers: [TimelineService],
  controllers: [TimelineController],
})
export class TimelineModule {}
