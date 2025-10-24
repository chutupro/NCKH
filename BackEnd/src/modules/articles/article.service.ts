import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articles } from '../entities/article.entity';
import { Images } from '../entities/image.entity';

type ListOptions = { page?: number; perPage?: number };

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Articles)
    private readonly articleRepo: Repository<Articles>,
    @InjectRepository(Images)
    private readonly imageRepo: Repository<Images>,
  ) {}

  // 📄 Lấy danh sách bài viết có phân trang
  async list(opts: ListOptions = {}) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const perPage = opts.perPage && opts.perPage > 0 ? opts.perPage : 10;
    const skip = (page - 1) * perPage;

    const [items, total] = await this.articleRepo.findAndCount({
      relations: ['images', 'category'],
      order: { CreatedAt: 'DESC' },
      skip,
      take: perPage,
    });

    return {
      total,
      page,
      perPage,
      items,
    };
  }

  // ✏️ Tạo bài viết mới (có thể kèm ảnh)
  async create(payload: any): Promise<Articles> {
    const { Title, Content, Language, UserID, CategoryID, images } = payload;

    if (!Title) throw new Error('Title is required');

    const article = this.articleRepo.create({
      Title,
      Content,
      Language,
      UserID: UserID ?? null,
      CategoryID: CategoryID ?? null,
    });

    const savedArticle = await this.articleRepo.save(article);

    // Nếu có gửi kèm hình ảnh
    if (Array.isArray(images) && images.length > 0) {
      const imgs = images.map((img) =>
        this.imageRepo.create({
          ArticleID: savedArticle.ArticleID,
          FilePath: img.FilePath,
          AltText: img.AltText ?? null,
          Type: img.Type ?? 'main',
        }),
      );
      await this.imageRepo.save(imgs);
    }

    return savedArticle;
  }
}
