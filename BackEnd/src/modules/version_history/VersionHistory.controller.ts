import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { VersionHistoryService } from './VersionHistory.service';
import { VersionHistoryCreateDto } from './dto/VersionHistory.create';
import { VersionHistoryUpdateDto } from './dto/VersionHistory.update';

@Controller('version-histories')
export class VersionHistoryController {
  constructor(private readonly service: VersionHistoryService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { message: 'Lấy danh sách version histories thành công', data };
    } catch (err) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách version histories');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.service.findOne(id);
      return { message: `Lấy version history ID = ${id} thành công`, data: item };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Lỗi khi truy xuất dữ liệu version history');
    }
  }

  @Post()
  async create(@Body() dto: VersionHistoryCreateDto) {
    try {
      const created = await this.service.create(dto);
      return { message: 'Tạo version history thành công', data: created };
    } catch (err) {
      throw new BadRequestException('Dữ liệu không hợp lệ hoặc lỗi khi tạo mới');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VersionHistoryUpdateDto,
  ) {
    try {
      const updated = await this.service.update(id, dto);
      return { message: `Cập nhật version history ID = ${id} thành công`, data: updated };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException('Lỗi khi cập nhật version history');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.service.remove(id);
      return { message: `Đã xóa version history ID = ${id}`, data: result };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Lỗi khi xóa version history');
    }
  }
}
