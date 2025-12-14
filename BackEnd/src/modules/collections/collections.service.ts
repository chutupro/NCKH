import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collections } from '../entities/collection.entity';
import { CollectionArticles } from '../entities/collection-article.entity';
import { Articles } from '../entities/article.entity';
import { Images } from '../entities/image.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collections)
    private collectionRepo: Repository<Collections>,
    @InjectRepository(CollectionArticles)
    private collectionArticleRepo: Repository<CollectionArticles>,
    @InjectRepository(Articles)
    private articleRepo: Repository<Articles>,
    @InjectRepository(Images)
    private imagesRepo: Repository<Images>,
  ) {}

  async create(payload: { Name: string; Title?: string; Description?: string; ImagePath?: string; ImageDescription?: string; Year?: number; CategoryID?: number; ArticleIDs?: number[] }) {
    console.log('🔵 [Collections.create] Received payload:', JSON.stringify(payload, null, 2));
    
    const collection = this.collectionRepo.create({
      Name: payload.Name,
      Title: payload.Title,
      Description: payload.Description,
      ImagePath: payload.ImagePath,
      ImageDescription: payload.ImageDescription,
      Year: payload.Year || undefined,
      CategoryID: payload.CategoryID ?? undefined,
    });
    const saved = await this.collectionRepo.save(collection as any);

    // ✅ TỰ ĐỘNG update/tạo ảnh trong Images table khi tạo Collection
    if (payload.ImagePath) {
      console.log(`🔍 [Collections] Searching for existing image with FilePath: "${payload.ImagePath}"`);
      
      // Tìm ảnh đã tồn tại với FilePath này (từ /upload API)
      const existingImage = await this.imagesRepo.findOne({
        where: { FilePath: payload.ImagePath }
      });
      
      console.log(`🔍 [Collections] Search result:`, existingImage ? `Found ImageID=${existingImage.ImageID}` : 'NOT FOUND');

      if (existingImage) {
        // UPDATE ảnh đã có
        existingImage.CollectionID = (saved as any).CollectionID;
        existingImage.AltText = payload.Title || payload.Name;
        existingImage.Type = 'collection';
        await this.imagesRepo.save(existingImage);
        console.log(`[Collections] ✅ Updated existing Image (ImageID=${existingImage.ImageID}) with CollectionID=${(saved as any).CollectionID}, AltText="${payload.Title || payload.Name}"`);
      } else {
        // TẠO MỚI nếu chưa có
        const image = this.imagesRepo.create({
          FilePath: payload.ImagePath,
          AltText: payload.Title || payload.Name,
          Type: 'collection',
          CategoryID: payload.CategoryID ?? null,
          CollectionID: (saved as any).CollectionID,
          ArticleID: null,
        });
        await this.imagesRepo.save(image);
        console.log(`[Collections] ✅ Created new Image for Collection "${payload.Title || payload.Name}" (CollectionID=${(saved as any).CollectionID})`);
      }
    }

    if (payload.ArticleIDs && payload.ArticleIDs.length) {
      const mappings = payload.ArticleIDs.map((aid) =>
        this.collectionArticleRepo.create({ CollectionID: (saved as any).CollectionID, ArticleID: aid }),
      );
      await this.collectionArticleRepo.save(mappings as any);
    }

    return this.findOne((saved as any).CollectionID);
  }

  async findAll() {
    // ✅ CHỈ trả về collections có ảnh CHƯA được gắn vào MapLocations
    const query = this.collectionRepo.createQueryBuilder('col')
      .leftJoinAndSelect('col.collectionArticles', 'colArticles')
      .leftJoinAndSelect('colArticles.article', 'article')
      .leftJoinAndSelect('article.images', 'articleImages')
      .leftJoinAndSelect('col.category', 'category')
      .leftJoin('Images', 'img', 'img.CollectionID = col.CollectionID')
      .leftJoin('MapLocations', 'mapLocMain', 'mapLocMain.MainImageID = img.ImageID')
      .leftJoin('MapLocations', 'mapLocOld', 'mapLocOld.OldImageID = img.ImageID')
      .where('mapLocMain.LocationID IS NULL') // Ảnh CHƯA được dùng làm MainImageID
      .andWhere('mapLocOld.LocationID IS NULL') // Ảnh CHƯA được dùng làm OldImageID
      .orderBy('col.CollectionID', 'DESC');

    const cols = await query.getMany();

    console.log(`📚 [Collections.findAll] Found ${cols.length} collections (available for public library)`);

    return cols.map((c) => ({
      CollectionID: c.CollectionID,
      Name: c.Name,
      CategoryID: c.CategoryID,
      Category: c.category ? { CategoryID: c.category.CategoryID, Name: c.category.Name } : null,
      Title: c.Title,
      Description: c.Description,
      Year: c.Year,
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
      Year: c.Year,
      ImagePath: c.ImagePath,
      ImageDescription: c.ImageDescription,
      CreatedAt: c.CreatedAt,
      articles: (c.collectionArticles || []).map((ca) => ca.article),
    };
  }

  async update(id: number, payload: { Name?: string; Title?: string; Description?: string; Year?: number; ImagePath?: string; ImageDescription?: string; CategoryID?: number; ArticleIDs?: number[] }) {
    const collection = await this.collectionRepo.findOne({ where: { CollectionID: id } });
    if (!collection) {
      throw new Error('Collection not found');
    }

    // Update basic fields
    if (payload.Name !== undefined) collection.Name = payload.Name;
    if (payload.Title !== undefined) collection.Title = payload.Title;
    if (payload.Description !== undefined) collection.Description = payload.Description;
    if (payload.Year !== undefined) collection.Year = payload.Year;
    if (payload.ImagePath !== undefined) collection.ImagePath = payload.ImagePath;
    if (payload.ImageDescription !== undefined) collection.ImageDescription = payload.ImageDescription;
    if (payload.CategoryID !== undefined) collection.CategoryID = payload.CategoryID;

    await this.collectionRepo.save(collection as any);

    // Update article mappings if provided
    if (payload.ArticleIDs !== undefined) {
      // Remove old mappings
      await this.collectionArticleRepo.delete({ CollectionID: id });
      
      // Add new mappings
      if (payload.ArticleIDs.length > 0) {
        const mappings = payload.ArticleIDs.map((aid) =>
          this.collectionArticleRepo.create({ CollectionID: id, ArticleID: aid }),
        );
        await this.collectionArticleRepo.save(mappings as any);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const collection = await this.collectionRepo.findOne({ where: { CollectionID: id } });
    if (!collection) {
      throw new Error('Collection not found');
    }

    // Delete related collection-article mappings first
    await this.collectionArticleRepo.delete({ CollectionID: id });
    
    // Delete the collection
    await this.collectionRepo.delete({ CollectionID: id });

    return { message: 'Collection deleted successfully', CollectionID: id };
  }
}
