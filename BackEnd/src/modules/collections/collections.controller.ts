import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto as any);
  }

  @Get()
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.update(Number(id), dto as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(Number(id));
  }
}
