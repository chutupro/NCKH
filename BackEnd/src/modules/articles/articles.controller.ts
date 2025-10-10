import { Body, Controller, Delete, Get, Param, Patch, Post, Put, ParseIntPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/articles.create.dto';
import { UpdateArticleDto } from './dto/articles.update.dto';


@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateArticleDto) {
    return this.articlesService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateDto);
  }

  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() createDto: CreateArticleDto) {
    return this.articlesService.replace(id, createDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}