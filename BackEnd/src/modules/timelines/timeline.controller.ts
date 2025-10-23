import { Controller, Post, Body } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post('items')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['Kiến trúc', 'Văn hóa', 'Du lịch', 'Thiên nhiên'],
          },
        },
      },
      example: { categories: ['Du lịch', 'Thiên nhiên'] },
    },
  })
  async getTimelineItems(@Body('categories') categories?: string[]) {
    return this.timelineService.getTimelineItems(categories);
  }
}
