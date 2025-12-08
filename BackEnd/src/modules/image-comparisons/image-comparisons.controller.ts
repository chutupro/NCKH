import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ImageComparisonsService } from './image-comparisons.service';
import { CreateImageComparisonDto } from './dto/create-image-comparison.dto';
import { UpdateImageComparisonDto } from './dto/update-image-comparison.dto';
import { CreateComparisonImageDto } from './dto/create-comparison-image.dto';
import { UpdateComparisonImageDto } from './dto/update-comparison-image.dto';

@Controller('imagecomparisons')
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

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateImageComparisonDto) {
    return this.svc.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }

  // ========== IMAGE CRUD ==========
  @Post(':id/images')
  createImage(@Param('id') id: string, @Body() dto: CreateComparisonImageDto) {
    return this.svc.createImage(Number(id), dto);
  }

  @Put(':id/images/:imageId')
  updateImage(@Param('id') id: string, @Param('imageId') imageId: string, @Body() dto: UpdateComparisonImageDto) {
    return this.svc.updateImage(Number(imageId), dto);
  }

  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.svc.removeImage(Number(imageId));
  }
}
