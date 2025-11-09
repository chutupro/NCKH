import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ImageComparisonsService } from './image-comparisons.service';
import { CreateImageComparisonDto } from './dto/create-image-comparison.dto';

@Controller('image-comparisons')
export class ImageComparisonsController {
  constructor(private readonly svc: ImageComparisonsService) {}

  @Post()
  create(@Body() dto: CreateImageComparisonDto) {
    return this.svc.create(dto as any);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }
}
