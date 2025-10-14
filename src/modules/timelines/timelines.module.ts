import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelinesService } from './services/timelines.service';
import { TimelinesController } from './controllers/timelines.controller';
import { Timeline } from './entities/timeline.entity';

/**
 * Timelines module
 */
@Module({
  imports: [TypeOrmModule.forFeature([Timeline])],
  providers: [TimelinesService],
  controllers: [TimelinesController],
  exports: [TimelinesService],
})
export class TimelinesModule {}

