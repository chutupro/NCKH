import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { MapLocationService } from './MapLocations.Service';
import { MapLocationCreateDto } from './dto/MapLocationCreateDto';
import { MapLocationUpdateDto } from './dto/MapLocationUpdateDto';

@Controller('map-locations')
export class MapLocationController {
  constructor(private readonly service: MapLocationService) {}

  // Lấy tất cả map locations
  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { message: 'Lấy danh sách map locations thành công', data };
    } catch {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách map locations');
    }
  }

  // Lấy map locations theo bài viết
  @Get('article/:articleId')
  async findByArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    try {
      const data = await this.service.findByArticle(articleId);
      return { message: `Lấy map locations theo bài viết ${articleId} thành công`, data };
    } catch {
      throw new InternalServerErrorException('Lỗi khi lấy map locations theo bài viết');
    }
  }

  // Lấy 1 map location theo ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.service.findOne(id);
      return { message: `Lấy map location ID = ${id} thành công`, data: item };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Lỗi khi truy xuất map location');
    }
  }

  // Tạo map location mới
  @Post()
  async create(@Body() dto: MapLocationCreateDto) {
    try {
      const created = await this.service.create(dto);
      return { message: 'Tạo map location thành công', data: created };
    } catch (err) {
      throw new BadRequestException('Dữ liệu không hợp lệ khi tạo map location');
    }
  }

  // Cập nhật map location
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: MapLocationUpdateDto) {
    try {
      const updated = await this.service.update(id, dto);
      return { message: `Cập nhật map location ID = ${id} thành công`, data: updated };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException('Lỗi khi cập nhật map location');
    }
  }

  // Xóa map location
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.service.remove(id);
      return { message: `Đã xóa map location ID = ${id}`, data: result };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Lỗi khi xóa map location');
    }
  }
}