import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Images } from '../modules/entities/image.entity';

/**
 * Service quản lý DB Images table
 * Lưu filepath từ Media Service vào database
 */
@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Images)
    private imagesRepo: Repository<Images>,
  ) {}

  /**
   * Tạo record Images mới
   */
  async create(
    filePath: string,
    articleId?: number | null,
    altText?: string | null,
    type?: string | null,
    categoryId?: number | null,
    collectionId?: number | null,
  ): Promise<Images> {
    const image = this.imagesRepo.create({
      FilePath: filePath,
      ArticleID: articleId ?? null,
      AltText: altText ?? null,
      Type: type ?? 'post',
      CategoryID: categoryId ?? null,
      CollectionID: collectionId ?? null,
    });

    const saved = await this.imagesRepo.save(image);
    console.log(`[ImagesService] ✅ Saved to DB: ImageID=${saved.ImageID}, FilePath=${filePath}`);
    
    return saved;
  }

  async findByArticleId(articleId: number): Promise<Images[]> {
    return this.imagesRepo.find({
      where: { ArticleID: articleId },
      order: { ImageID: 'ASC' },
    });
  }

  async findOne(imageId: number): Promise<Images | null> {
    return this.imagesRepo.findOne({ where: { ImageID: imageId } });
  }

  async updateCollectionId(imageId: number, collectionId: number): Promise<void> {
    await this.imagesRepo.update({ ImageID: imageId }, { CollectionID: collectionId });
  }

  async delete(imageId: number): Promise<void> {
    await this.imagesRepo.delete(imageId);
  }

  async deleteByArticleId(articleId: number): Promise<void> {
    await this.imagesRepo.delete({ ArticleID: articleId });
  }

  /**
   * Lấy danh sách ảnh có thể gắn location
   * CHỈ lấy ảnh XƯA từ thư viện (có CollectionID)
   * KHÔNG lấy ảnh đã gắn vào location (không có trong LocationImages)
   * Không lấy ảnh hiện đại vừa upload (CollectionID = NULL)
   */
  async getAvailableImagesForLocation(
    category?: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ images: Images[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.imagesRepo
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.category', 'category')
      .leftJoinAndSelect('image.collection', 'collection')
      .leftJoin('MapLocations', 'mapLoc', 'mapLoc.OldImageID = image.ImageID')
      .where('image.CollectionID IS NOT NULL') // ✅ CHỈ lấy ảnh có bộ sưu tập (ảnh xưa)
      .andWhere('mapLoc.LocationID IS NULL') // ✅ Chưa được gắn vào MapLocations (OldImageID)
      .orderBy('image.ImageID', 'DESC')
      .skip(skip)
      .take(limit);

    // Lọc theo category nếu có
    if (category) {
      queryBuilder.andWhere('category.Slug = :category', { category });
    }

    const [images, total] = await queryBuilder.getManyAndCount();

    return {
      images: images.map(img => ({
        ...img,
        FilePath: img.FilePath?.startsWith('http') 
          ? img.FilePath 
          : `http://localhost:3000${img.FilePath}`,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
