import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '@nestjs/swagger';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Lấy tất cả phân tích' })
  findAll() {
    return this.analyticsService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Lấy phân tích theo ID' })
  async findOne(@Param('id') id: number) {
    const analytics = await this.analyticsService.findOne(id);
    if (!analytics) {
      throw new HttpException('Phân tích không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return analytics;
  }

  @Post()
  @ApiResponse({ status: 200, description: 'Tạo phân tích mới' })
  create(@Body(new ValidationPipe()) analyticsData: CreateAnalyticsDto) {
    return this.analyticsService.create(analyticsData);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Cập nhật phân tích' })
  update(@Body() analyticsData: UpdateAnalyticsDto, @Param('id') id: number) {
    return this.analyticsService.update(id, analyticsData);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa phân tích' })
  async delete(@Param('id') id: number) {
    const analytics = await this.analyticsService.delete(id);
    if (!analytics) {
      throw new HttpException('Phân tích không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return analytics;
  }

  @Post(':id/view')
  @ApiResponse({ status: 200, description: 'Tăng số lượt xem' })
  async incrementViewCount(@Param('id') id: number) {
    const analytics = await this.analyticsService.incrementViewCount(id);
    if (!analytics) {
      throw new HttpException('Phân tích không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return analytics;
  }
}