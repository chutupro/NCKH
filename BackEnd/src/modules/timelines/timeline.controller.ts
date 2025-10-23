import { Controller, Get } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  // GET /timeline/items
  @Get('items')
  async getTimelineItems() {
    return this.timelineService.getTimelineItems();
  }
}
