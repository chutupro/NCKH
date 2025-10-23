import { Controller, Get, Param } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  // 🟢 GET /timeline
  @Get()
  getAll() {
    return this.timelineService.findAll();
  }

  // 🟢 GET /timeline/category/:category
  @Get('category/:category')
  getByCategory(@Param('category') category: string) {
    return this.timelineService.findByCategory(category);
  }

  // 🟢 GET /timeline/:id
  @Get(':id')
  getById(@Param('id') id: number) {
    return this.timelineService.findById(id);
  }
}
