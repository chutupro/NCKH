import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articles } from '../entities/article.entity';
import { Users } from '../entities/user.entity';
import { Categories } from '../entities/category.entity';
import { Images } from '../entities/image.entity';
import { Analytics } from '../entities/analytics.entity';
import { Likes } from '../entities/like.entity';
import { UpdateArticleDto } from './dto/update-article.dto';

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

  // --- DELETE ARTICLE ---
async deleteArticle(articleId: number) {
  // Tìm bài viết theo ID
  const article = await this.articleRepo.findOne({
    where: { ArticleID: articleId },
    relations: ['images', 'analytics', 'likes'], // load luôn quan hệ
  });

  if (!article) throw new Error('Article not found');

  // Xóa dữ liệu liên quan
  if (article.images?.length) {
    await this.imageRepo.remove(article.images);
  }
  if (article.analytics?.length) {
    await this.analyticRepo.remove(article.analytics);
  }
  if (article.likes?.length) {
    await this.likeRepo.remove(article.likes);
  }

  // Xóa bài viết
  await this.articleRepo.remove(article);

  return { message: 'Article and related data deleted successfully' };
}
  async updateArticle(articleId: number, dto: UpdateArticleDto) {
  const article = await this.articleRepo.findOne({
    where: { ArticleID: articleId },
    relations: ['images', 'category'],
  });

  if (!article) throw new Error('Article not found');

  // Update title, content, category nếu có
  if (dto.title !== undefined) article.Title = dto.title;
  if (dto.content !== undefined) article.Content = dto.content;

  if (dto.categoryId) {
    const category = await this.categoryRepo.findOne({ where: { CategoryID: dto.categoryId } });
    if (!category) throw new Error('Category not found');
    article.CategoryID = category.CategoryID;
    article.category = category;
  }

  await this.articleRepo.save(article);

  // Update image nếu có
  if (dto.imagePath) {
    let image = article.images?.[0];
    if (image) {
      image.FilePath = dto.imagePath;
      image.AltText = dto.imageDescription || '';
      await this.imageRepo.save(image);
    } else {
      image = this.imageRepo.create({
        FilePath: dto.imagePath,
        AltText: dto.imageDescription || '',
        ArticleID: article.ArticleID,
        article,
      });
      await this.imageRepo.save(image);
    }
  }

  return {
    id: article.ArticleID,
    title: article.Title,
    content: article.Content,
    category: article.category?.Name,
    image: article.images?.[0]?.FilePath || null,
    imageDescription: article.images?.[0]?.AltText || null,
  };
}


}