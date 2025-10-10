import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineService } from './Timeline.service';
import { TimelineController } from './Timeline.controller';
import { Timeline } from '../entities/timeline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Timeline])],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}