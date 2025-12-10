import { Controller, Get, Post, Put, Delete, Param, ParseIntPipe, Query, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private timelineService: TimelineService) {}

  // ===============================
  // Lấy danh sách timeline (mặc định)
  // ===============================
  @Get()
  async getItems(
    @Query('categories') categories?: string,
    @Query('fromYear') fromYear?: string,
    @Query('toYear') toYear?: string,
  ) {
    const catArray = categories ? categories.split(',') : undefined;
    return this.timelineService.getTimelineItems(catArray, fromYear, toYear);
  }

  // ===============================
  // Route cũ: /timeline/items -> danh sách timeline
  // ===============================
  @Get('items')
  async getItemsOld(
    @Query('categories') categories?: string,
    @Query('fromYear') fromYear?: string,
    @Query('toYear') toYear?: string,
  ) {
    return this.getItems(categories, fromYear, toYear);
  }

  // ===============================
  // Route cũ: /timeline/items/:id -> chi tiết timeline
  // ===============================
  @Get('items/:id')
  async getItemOld(@Param('id', ParseIntPipe) id: number) {
    const item = await this.timelineService.getTimelineItemById(id);
    if (!item) {
      throw new NotFoundException(`Timeline #${id} not found`);
    }
    return item;
  }

  // ===============================
  // Route mới: /timeline/:id -> chi tiết timeline
  // ===============================
  @Get(':id')
  async getItem(@Param('id', ParseIntPipe) id: number) {
    const item = await this.timelineService.getTimelineItemById(id);
    if (!item) {
      throw new NotFoundException(`Timeline #${id} not found`);
    }
    return item;
  }

  // ===============================
  // CREATE Timeline
  // ===============================
  @Post()
  async create(@Body() body: any) {
    if (!body.ImageID) {
      throw new BadRequestException('ImageID bắt buộc');
    }
    if (!body.title || !body.eventDate) {
      throw new BadRequestException('Tiêu đề và ngày sự kiện bắt buộc');
    }
    // LocationID không bắt buộc - có thể null
    return this.timelineService.create(body);
  }

  // ===============================
  // UPDATE Timeline
  // ===============================
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.timelineService.update(id, body);
  }

  // ===============================
  // DELETE Timeline
  // ===============================
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.timelineService.delete(id);
    return { success: true, message: `Timeline #${id} đã xóa` };
  }
}
