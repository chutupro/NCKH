import {Body,Controller,Delete,Get,Param,Patch,Post,ParseIntPipe,BadRequestException,NotFoundException,InternalServerErrorException,} from '@nestjs/common';
import { TimelineService } from './Timeline.service';
import { TimelineCreateDto } from './dto/Timeline.create';
import { TimelineUpdateDto } from './dto/Timeline.update';

@Controller('timelines')
export class TimelineController {
  constructor(private readonly service: TimelineService) {}

  // ✅ Lấy tất cả timelines
  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { message: 'Lấy danh sách timeline thành công', data };
    } catch {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách timeline');
    }
  }

  // ✅ Lấy timeline theo bài viết
  @Get('article/:articleId')
  async findByArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    try {
      const data = await this.service.findByArticle(articleId);
      return { message: `Lấy timeline theo bài viết ${articleId} thành công`, data };
    } catch {
      throw new InternalServerErrorException('Lỗi khi lấy timeline theo bài viết');
    }
  }

  // ✅ Lấy 1 timeline theo ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.service.findOne(id);
      return { message: `Lấy timeline ID = ${id} thành công`, data: item };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Lỗi khi truy xuất timeline');
    }
  }

  // ✅ Tạo timeline mới
  @Post()
  async create(@Body() dto: TimelineCreateDto) {
    try {
      const created = await this.service.create(dto);
      return { message: 'Tạo timeline thành công', data: created };
    } catch (err) {
      throw new BadRequestException('Dữ liệu không hợp lệ khi tạo timeline');
    }
  }

  // ✅ Cập nhật timeline
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: TimelineUpdateDto) {
    try {
      const updated = await this.service.update(id, dto);
      return { message: `Cập nhật timeline ID = ${id} thành công`, data: updated };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException('Lỗi khi cập nhật timeline');
    }
  }

  // ✅ Xóa timeline
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.service.remove(id);
      return { message: `Đã xóa timeline ID = ${id}`, data: result };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Lỗi khi xóa timeline');
    }
  }
}
