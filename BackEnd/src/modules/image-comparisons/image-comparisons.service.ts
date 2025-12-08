import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageComparison } from '../entities/image-comparison.entity';
import { ComparisonImage } from '../entities/comparison-image.entity';
import { Categories } from '../entities/category.entity';

@Injectable()
export class ImageComparisonsService {
  constructor(
    @InjectRepository(ImageComparison)
    private compRepo: Repository<ImageComparison>,
    @InjectRepository(ComparisonImage)
    private compImageRepo: Repository<ComparisonImage>,
    @InjectRepository(Categories)
    private categoryRepo: Repository<Categories>,
  ) {}

  async create(payload: Partial<ImageComparison>) {
    const ent = this.compRepo.create(payload as ImageComparison);
    const saved = await this.compRepo.save(ent);
    return this.findOne(saved.ComparisonID);
  }

  async findAll() {
    const items = await this.compRepo.find({
      relations: ['category', 'images'],
    });
    return items.map((c) => {
      const allImages: ComparisonImage[] = (c.images || []).sort(
        (a, b) => a.DisplayOrder - b.DisplayOrder,
      );
      const firstImage = allImages.length > 0 ? allImages[0] : null;
      const lastImage =
        allImages.length > 0 ? allImages[allImages.length - 1] : null;

      return {
        ComparisonID: c.ComparisonID,
        Title: c.Title,
        Description: c.Description,
        CategoryID: c.CategoryID,
        Category: c.category
          ? { CategoryID: c.category.CategoryID, Name: c.category.Name }
          : null,
        Location: c.Address,
        firstImage: firstImage
          ? {
              src: firstImage.ImagePath,
              year: firstImage.Year,
              caption: firstImage.Caption || '',
            }
          : null,
        lastImage: lastImage
          ? {
              src: lastImage.ImagePath,
              year: lastImage.Year,
              caption: lastImage.Caption || '',
            }
          : null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });
  }

  async findOne(id: number) {
    const c = await this.compRepo.findOne({
      where: { ComparisonID: id },
      relations: ['category', 'images'],
    });
    if (!c) return null;

    const allImages: Array<{
      ImageID: number;
      src: string;
      year: number;
      caption: string;
      displayOrder: number;
    }> = (c.images || [])
      .sort((a, b) => a.DisplayOrder - b.DisplayOrder)
      .map((img) => ({
        ImageID: img.ImageID,
        src: img.ImagePath,
        year: img.Year,
        caption: img.Caption || '',
        displayOrder: img.DisplayOrder,
      }));

    return {
      ComparisonID: c.ComparisonID,
      Title: c.Title,
      Description: c.Description,
      CategoryID: c.CategoryID,
      Category: c.category
        ? { CategoryID: c.category.CategoryID, Name: c.category.Name }
        : null,
      Location: c.Address,
      images: allImages,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async update(id: number, payload: Partial<ImageComparison>) {
    await this.compRepo.update(id, payload as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.compRepo.delete(id);
    return { success: true, message: 'Deleted successfully' };
  }

  // ========== IMAGE CRUD ==========
  async createImage(comparisonId: number, payload: any) {
    const image = this.compImageRepo.create({
      ComparisonID: comparisonId,
      ImagePath: payload.ImagePath,
      Year: payload.Year,
      Caption: payload.Caption,
      DisplayOrder: payload.DisplayOrder || 0,
    });
    await this.compImageRepo.save(image);
    return this.findOne(comparisonId);
  }

  async updateImage(imageId: number, payload: any) {
    await this.compImageRepo.update(imageId, {
      ImagePath: payload.ImagePath,
      Year: payload.Year,
      Caption: payload.Caption,
      DisplayOrder: payload.DisplayOrder,
    });
    const image = await this.compImageRepo.findOne({
      where: { ImageID: imageId },
    });
    if (!image) throw new Error('Image not found');
    return this.findOne(image.ComparisonID);
  }

  async removeImage(imageId: number) {
    const image = await this.compImageRepo.findOne({
      where: { ImageID: imageId },
    });
    if (!image) throw new Error('Image not found');
    const comparisonId = image.ComparisonID;
    await this.compImageRepo.delete(imageId);
    return this.findOne(comparisonId);
  }
}
