import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ImageComparisonService } from './ImageComparisons.Service';
import { ImageComparisonCreateDto } from './dto/ImageComparisonCreateDto';
import { ImageComparisonUpdateDto } from './dto/ImageComparisonUpdateDto';

@Controller('image-comparisons')
export class ImageComparisonController {
  constructor(private readonly service: ImageComparisonService) {}

  // Lấy tất cả image comparisons
  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { message: 'Lấy danh sách image comparisons thành công', data };
    } catch {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách image comparisons');
    }
  }

  // Lấy image comparisons theo bài viết
  @Get('article/:articleId')
  async findByArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    try {
      const data = await this.service.findByArticle(articleId);
      return { message: `Lấy image comparisons theo bài viết ${articleId} thành công`, data };
    } catch {
      throw new InternalServerErrorException('Lỗi khi lấy image comparisons theo bài viết');
    }
  }

  // Lấy 1 image comparison theo ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.service.findOne(id);
      return { message: `Lấy image comparison ID = ${id} thành công`, data: item };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Lỗi khi truy xuất image comparison');
    }
  }

  // Tạo image comparison mới
  @Post()
  async create(@Body() dto: ImageComparisonCreateDto) {
    try {
      const created = await this.service.create(dto);
      return { message: 'Tạo image comparison thành công', data: created };
    } catch (err) {
      throw new BadRequestException('Dữ liệu không hợp lệ khi tạo image comparison');
    }
  }

  // Cập nhật image comparison
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: ImageComparisonUpdateDto) {
    try {
      const updated = await this.service.update(id, dto);
      return { message: `Cập nhật image comparison ID = ${id} thành công`, data: updated };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException('Lỗi khi cập nhật image comparison');
    }
  }

  // Xóa image comparison
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.service.remove(id);
      return { message: `Đã xóa image comparison ID = ${id}`, data: result };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Lỗi khi xóa image comparison');
    }
  }
}