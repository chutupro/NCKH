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
  ): Promise<Images> {
    const image = this.imagesRepo.create({
      FilePath: filePath,
      ArticleID: articleId ?? null,
      AltText: altText ?? null,
      Type: type ?? 'post',
      CategoryID: categoryId ?? null,
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

  async delete(imageId: number): Promise<void> {
    await this.imagesRepo.delete(imageId);
  }

  async deleteByArticleId(articleId: number): Promise<void> {
    await this.imagesRepo.delete({ ArticleID: articleId });
  }
}
