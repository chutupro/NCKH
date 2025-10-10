import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { TimelineService } from './Timeline.service';
import { TimelineCreateDto } from './dto/Timeline.create';
import { TimelineUpdateDto } from './dto/Timeline.update';

@Controller('timelines')
export class TimelineController {
  constructor(private readonly service: TimelineService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('article/:articleId')
  findByArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.service.findByArticle(articleId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: TimelineCreateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: TimelineUpdateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}