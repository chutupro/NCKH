import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from 'src/modules/entities';
import { CreateArticleDto } from './dto/articles.create.dto';
import { UpdateArticleDto } from './dto/articles.update.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  // Lấy tất cả bài viết
  findAll() {
    return this.articleRepository.find().catch((err) => {
      throw new BadRequestException('Không thể lấy danh sách bài viết: ' + err.message);
    });
  }

  // Lấy 1 bài viết theo ID
  findOne(id: number) {
    return this.articleRepository.findOneBy({ ArticleID: id }).then((article) => {
      if (!article) throw new NotFoundException(`Không tìm thấy bài viết có ID = ${id}`);
      return article;
    }).catch((err) => {
      throw new BadRequestException('Lỗi khi tìm bài viết: ' + err.message);
    });
  }

  // Tạo mới
  create(createDto: CreateArticleDto) {
    const entity = this.articleRepository.create(createDto as Partial<Article>);
    return this.articleRepository.save(entity).catch((err) => {
      throw new BadRequestException('Lỗi khi tạo bài viết: ' + err.message);
    });
  }

  // Cập nhật
  update(id: number, updateDto: UpdateArticleDto) {
    return this.articleRepository.update({ ArticleID: id }, updateDto as Partial<Article>)
      .then((result) => {
        if (result.affected === 0) throw new NotFoundException(`Không tìm thấy bài viết ID = ${id}`);
        return this.findOne(id);
      })
      .catch((err) => {
        throw new BadRequestException('Lỗi khi cập nhật bài viết: ' + err.message);
      });
  }

  // Ghi đè toàn bộ (PUT)
  replace(id: number, createDto: CreateArticleDto) {
    const entity = this.articleRepository.create({ ...createDto, ArticleID: id } as Partial<Article>);
    return this.articleRepository.save(entity).catch((err) => {
      throw new BadRequestException('Lỗi khi thay thế bài viết: ' + err.message);
    });
  }

  // Xóa
  remove(id: number) {
    return this.articleRepository.delete({ ArticleID: id })
      .then((res) => {
        if (res.affected === 0) throw new NotFoundException(`Không tìm thấy bài viết ID = ${id}`);
        return { deleted: true, id };
      })
      .catch((err) => {
        throw new BadRequestException('Lỗi khi xóa bài viết: ' + err.message);
      });
  }
}
