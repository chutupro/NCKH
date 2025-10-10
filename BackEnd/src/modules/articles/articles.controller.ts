import {Body,Controller,Delete,Get,Param,Patch,Post,Put,ParseIntPipe,BadRequestException,} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/articles.create.dto';
import { UpdateArticleDto } from './dto/articles.update.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // Lấy danh sách tất cả bài viết
  @Get()
  findAll() {
    return this.articlesService.findAll().catch((err) => {
      throw new BadRequestException('Lỗi khi lấy danh sách bài viết: ' + err.message);
    });
  }

  // Lấy 1 bài viết theo ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id).catch((err) => {
      throw new BadRequestException('Lỗi khi tìm bài viết: ' + err.message);
    });
  }

  // Tạo mới bài viết
  @Post()
  create(@Body() createDto: CreateArticleDto) {
    return this.articlesService.create(createDto).catch((err) => {
      throw new BadRequestException('Lỗi khi tạo bài viết: ' + err.message);
    });
  }

  // Cập nhật bài viết
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, updateDto).catch((err) => {
      throw new BadRequestException('Lỗi khi cập nhật bài viết: ' + err.message);
    });
  }

  // Ghi đè toàn bộ bài viết (PUT)
  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDto: CreateArticleDto,
  ) {
    return this.articlesService.replace(id, createDto).catch((err) => {
      throw new BadRequestException('Lỗi khi thay thế bài viết: ' + err.message);
    });
  }

  // Xóa bài viết
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id).catch((err) => {
      throw new BadRequestException('Lỗi khi xóa bài viết: ' + err.message);
    });
  }
}
