import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';

@ApiTags('timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('items')
  @ApiQuery({
    name: 'categories',
    required: false,
    type: String,
    isArray: true,
    example: ['Du lịch', 'Thiên nhiên'],
  })
  async getTimelineItems(@Query('categories') categories?: string | string[]) {
    if (typeof categories === 'string') {
      // Hỗ trợ query dạng: ?categories=Du lịch,Thiên nhiên
      categories = categories.split(',').map((c) => c.trim());
    }

    return this.timelineService.getTimelineItems(categories);
  }
}
