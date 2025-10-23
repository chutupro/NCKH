import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articles } from '../entities/article.entity';
import { Users } from '../entities/user.entity';
import { UserProfiles } from '../entities/user-profile.entity';
import { Categories } from '../entities/category.entity';
import { Images } from '../entities/image.entity';
import { Analytics } from '../entities/analytics.entity';
import { Likes } from '../entities/like.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Articles)
    private articleRepo: Repository<Articles>,
    @InjectRepository(Users)
    private userRepo: Repository<Users>,
    @InjectRepository(UserProfiles)
    private profileRepo: Repository<UserProfiles>,
    @InjectRepository(Categories)
    private categoryRepo: Repository<Categories>,
    @InjectRepository(Images)
    private imageRepo: Repository<Images>,
    @InjectRepository(Analytics)
    private analyticRepo: Repository<Analytics>,
    @InjectRepository(Likes)
    private likeRepo: Repository<Likes>,
  ) {}

  async getAllArticles() {
    const articles = await this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.images', 'images')
      .leftJoinAndSelect('article.analytics', 'analytics')
      .loadRelationCountAndMap('article.likeCount', 'article.likes')
      .orderBy('article.createdAt', 'DESC')
      .getMany();

    // Chuẩn hóa dữ liệu trả về
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
}
