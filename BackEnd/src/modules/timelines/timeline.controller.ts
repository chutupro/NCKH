// src/modules/timelines/timeline.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private timelineService: TimelineService) {}

  @Get('items')
  async getItems(
    @Query('categories') categories?: string,
    @Query('fromYear') fromYear?: string,
    @Query('fromYear') toYear?: string,
  ) {
    const catArray = categories ? categories.split(',') : undefined;
    return this.timelineService.getTimelineItems(catArray, fromYear, toYear);
  }

  @Get('items/:id')
  async getItem(@Param('id', ParseIntPipe) id: number) {
    return this.timelineService.getTimelineItemById(id);
  }
}