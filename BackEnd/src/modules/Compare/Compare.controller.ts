import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ImageComparison } from '../entities/image-comparison.entity';
import { CompareService } from './Compare.service';

@ApiTags('Compare')
@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @ApiOperation({ summary: 'Lấy danh sách các so sánh hình ảnh (có phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng bản ghi mỗi trang' })
  @Get()
  async getAll(@Query() query: any) {
    return this.compareService.getAll(query);
  }

  @ApiOperation({ summary: 'Tạo mới một mục so sánh hình ảnh' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        Title: { type: 'string', example: 'So sánh Cầu Rồng xưa và nay' },
        Description: { type: 'string', example: 'So sánh hình ảnh năm 2010 và 2024' },
        YearOld: { type: 'integer', example: 2010 },
        YearNew: { type: 'integer', example: 2024 },
        Location: { type: 'string', example: 'Đà Nẵng' },
        CategoryID: { type: 'integer', example: 3 },
        oldImage: {
          type: 'object',
          properties: {
            FilePath: { type: 'string', example: 'https://example.com/old.jpg' },
            AltText: { type: 'string', example: 'Cầu Rồng năm 2010' },
          },
        },
        newImage: {
          type: 'object',
          properties: {
            FilePath: { type: 'string', example: 'https://example.com/new.jpg' },
            AltText: { type: 'string', example: 'Cầu Rồng năm 2024' },
          },
        },
      },
      required: ['Title', 'YearOld', 'YearNew', 'oldImage', 'newImage'],
    },
  })
  @Post()
  async create(@Body() body: any): Promise<ImageComparison> {
    return this.compareService.create(body);
  }
}
