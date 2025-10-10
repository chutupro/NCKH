import {Body,Controller,Delete,Get,Param,Patch,Post,ParseIntPipe,} from '@nestjs/common';
import { ImageService } from './Image.service';
import { ImageCreateDto } from './dto/Image.create.dto';
import { ImageUpdateDto } from './dto/Image.update';

@Controller('images')
export class ImageController {
  constructor(private readonly service: ImageService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: ImageCreateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ImageUpdateDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
