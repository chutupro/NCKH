import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collections } from '../entities/collection.entity';
import { CollectionArticles } from '../entities/collection-article.entity';
import { Articles } from '../entities/article.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collections)
    private collectionRepo: Repository<Collections>,
    @InjectRepository(CollectionArticles)
    private collectionArticleRepo: Repository<CollectionArticles>,
    @InjectRepository(Articles)
    private articleRepo: Repository<Articles>,
  ) {}

  async create(payload: { Name: string; Title?: string; Description?: string; ImagePath?: string; ImageDescription?: string; CategoryID?: number; ArticleIDs?: number[] }) {
    const collection = this.collectionRepo.create({
      Name: payload.Name,
      Title: payload.Title,
      Description: payload.Description,
      ImagePath: payload.ImagePath,
      ImageDescription: payload.ImageDescription,
      CategoryID: payload.CategoryID ?? undefined,
    });
    const saved = await this.collectionRepo.save(collection as any);

    if (payload.ArticleIDs && payload.ArticleIDs.length) {
      const mappings = payload.ArticleIDs.map((aid) =>
        this.collectionArticleRepo.create({ CollectionID: (saved as any).CollectionID, ArticleID: aid }),
      );
      await this.collectionArticleRepo.save(mappings as any);
    }

    return this.findOne((saved as any).CollectionID);
  }

  async findAll() {
  const cols = await this.collectionRepo.find({ relations: ['collectionArticles', 'collectionArticles.article', 'collectionArticles.article.images', 'category'] });

    return cols.map((c) => ({
      CollectionID: c.CollectionID,
      Name: c.Name,
      CategoryID: c.CategoryID,
      Category: c.category ? { CategoryID: c.category.CategoryID, Name: c.category.Name } : null,
      Title: c.Title,
      Description: c.Description,
      ImagePath: c.ImagePath,
      ImageDescription: c.ImageDescription,
      CreatedAt: c.CreatedAt,
      articles: (c.collectionArticles || []).map((ca) => ca.article),
    }));
  }

  async findOne(id: number) {
  const c = await this.collectionRepo.findOne({ where: { CollectionID: id }, relations: ['collectionArticles', 'collectionArticles.article', 'collectionArticles.article.images', 'category'] });
    if (!c) return null;
    return {
      CollectionID: c.CollectionID,
      Name: c.Name,
      CategoryID: c.CategoryID,
      Category: c.category ? { CategoryID: c.category.CategoryID, Name: c.category.Name } : null,
      Title: c.Title,
      Description: c.Description,
      ImagePath: c.ImagePath,
      ImageDescription: c.ImageDescription,
      CreatedAt: c.CreatedAt,
      articles: (c.collectionArticles || []).map((ca) => ca.article),
    };
  }
}
