import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { Articles } from '../entities/article.entity';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ summary: 'Lấy danh sách bài viết (có phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 10 })
  @Get()
  async list(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const pp = perPage ? parseInt(perPage, 10) : 10;
    return this.articleService.list({ page: p, perPage: pp });
  }

  @ApiOperation({ summary: 'Tạo mới bài viết (có thể kèm hình ảnh)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        Title: { type: 'string', example: 'Cầu Rồng Đà Nẵng' },
        Content: { type: 'string', example: 'Bài viết mô tả chi tiết về Cầu Rồng...' },
        Language: { type: 'string', example: 'vi' },
        UserID: { type: 'integer', example: 1 },
        CategoryID: { type: 'integer', example: 2 },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              FilePath: { type: 'string', example: 'https://example.com/img1.jpg' },
              AltText: { type: 'string', example: 'Cầu Rồng về đêm' },
              Type: { type: 'string', example: 'main' },
            },
          },
        },
      },
      required: ['Title'],
    },
  })
  @Post()
  async create(@Body() body: any): Promise<Articles> {
    return this.articleService.create(body);
  }
}
