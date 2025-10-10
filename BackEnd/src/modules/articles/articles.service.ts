import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/modules/entities';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/articles.create.dto';
import { UpdateArticleDto } from './dto/articles.update.dto';


@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  findAll(): Promise<Article[]> {
    return this.articleRepository.find();
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOneBy({ ArticleID: id });
    if (!article) throw new NotFoundException(`Article ${id} not found`);
    return article;
  }

  create(createDto: CreateArticleDto): Promise<Article> {
    const entity = this.articleRepository.create(createDto as Partial<Article>);
    return this.articleRepository.save(entity);
  }

  async update(id: number, updateDto: UpdateArticleDto): Promise<Article> {
    await this.articleRepository.update({ ArticleID: id }, updateDto as Partial<Article>);
    return this.findOne(id);
  }

  async replace(id: number, createDto: CreateArticleDto): Promise<Article> {
    const entity = this.articleRepository.create({ ...createDto, ArticleID: id } as Partial<Article>);
    return this.articleRepository.save(entity);
  }

  async remove(id: number) {
    await this.articleRepository.delete({ ArticleID: id });
    return { deleted: true, id };
  }
}