import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articles } from '../entities/article.entity';
import { Users } from '../entities/user.entity';
import { Categories } from '../entities/category.entity';
import { Images } from '../entities/image.entity';
import { Analytics } from '../entities/analytics.entity';
import { Likes } from '../entities/like.entity';

interface CreateArticleDto {
  title: string;
  content?: string;
  categoryId: number;
  userId: number;
  email?: string;
  imageDescription?: string;
  imagePath?: string;
}

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Articles)
    private articleRepo: Repository<Articles>,
    @InjectRepository(Users)
    private userRepo: Repository<Users>,
    @InjectRepository(Categories)
    private categoryRepo: Repository<Categories>,
    @InjectRepository(Images)
    private imageRepo: Repository<Images>,
    @InjectRepository(Analytics)
    private analyticRepo: Repository<Analytics>,
    @InjectRepository(Likes)
    private likeRepo: Repository<Likes>,
  ) {}

  // --- GET ALL ARTICLES ---
  async getAllArticles() {
    const articles = await this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.images', 'images')
      .leftJoinAndSelect('article.analytics', 'analytics')
      .loadRelationCountAndMap('article.likeCount', 'article.likes')
      .orderBy('article.CreatedAt', 'DESC')
      .getMany();

    return articles.map((a) => ({
      id: a.ArticleID,
      title: a.Title,
      content: a.Content,
      createdAt: a.CreatedAt,
      category: a.category?.Name,
      author: {
        id: a.user?.UserID,
        fullName: a.user?.FullName,
        avatar: a.user?.profile?.Avatar || null,
      },
      image: a.images?.length ? a.images[0].FilePath : null,
      viewCount: a.analytics?.[0]?.ViewCount || 0,
      likeCount: (a as any).likeCount || 0,
    }));
  }

  // --- CREATE NEW ARTICLE ---
  async createArticle(dto: CreateArticleDto) {
    const user = await this.userRepo.findOne({ where: { UserID: dto.userId } });
    const category = await this.categoryRepo.findOne({ where: { CategoryID: dto.categoryId } });

    if (!user) throw new Error('User not found');
    if (!category) throw new Error('Category not found');

    const article = this.articleRepo.create({
      Title: dto.title,
      Content: dto.content,
      UserID: dto.userId,
      CategoryID: dto.categoryId,
      user,
      category,
    });
    await this.articleRepo.save(article);

    if (dto.imagePath) {
      const image = this.imageRepo.create({
        FilePath: dto.imagePath,
        AltText: dto.imageDescription || '',
        ArticleID: article.ArticleID,
        article,
      });
      await this.imageRepo.save(image);
    }

    return {
      id: article.ArticleID,
      title: article.Title,
      content: article.Content,
      category: category.Name,
      author: {
        id: user.UserID,
        fullName: user.FullName,
        email: dto.email || user.Email,
      },
      image: dto.imagePath || null,
      imageDescription: dto.imageDescription || null,
    };
  }
}
