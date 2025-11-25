import { Controller, Get, Param, ParseIntPipe, Query, NotFoundException } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private timelineService: TimelineService) {}

  @Get()
  async getItems(
    @Query('categories') categories?: string,
    @Query('fromYear') fromYear?: string,
    @Query('toYear') toYear?: string,
  ) {
    const catArray = categories ? categories.split(',') : undefined;
    return this.timelineService.getTimelineItems(catArray, fromYear, toYear);
  }

  @Get('items')
  async getItemsOld(
    @Query('categories') categories?: string,
    @Query('fromYear') fromYear?: string,
    @Query('toYear') toYear?: string,
  ) {
    return this.getItems(categories, fromYear, toYear);
  }

  @Get('items/:id')
  async getItemOld(@Param('id', ParseIntPipe) id: number) {
    const item = await this.timelineService.getTimelineItemById(id);
    if (!item) {
      throw new NotFoundException(`Timeline #${id} not found`);
    }
    return item;
  }

  @Get(':id')
  async getItem(@Param('id', ParseIntPipe) id: number) {
    const item = await this.timelineService.getTimelineItemById(id);
    if (!item) {
      throw new NotFoundException(`Timeline #${id} not found`);
    }
    return item;
  }
}
