import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageComparison } from '../entities/image-comparison.entity';
import { Images } from '../entities/image.entity';
import { Categories } from '../entities/category.entity';

@Injectable()
export class CompareService {
  constructor(
    @InjectRepository(ImageComparison)
    private readonly compareRepo: Repository<ImageComparison>,

    @InjectRepository(Images)
    private readonly imageRepo: Repository<Images>,

    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
  ) {}

  // 📋 Lấy danh sách tất cả
  async getAll(query: any) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await this.compareRepo
    .createQueryBuilder('compare')
    .leftJoinAndSelect('compare.category', 'category')
    .orderBy('compare.createdAt', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}



  // 🆕 Tạo mới một bản so sánh
  async create(data: any): Promise<ImageComparison> {
    const { Title, Description, YearOld, YearNew, Location, CategoryID, oldImage, newImage } = data;

    if (!Title || !YearOld || !YearNew) {
      throw new BadRequestException('Thiếu thông tin bắt buộc (Title, YearOld, YearNew)');
    }

    // ✅ Kiểm tra category (nếu có)
    let category: Categories | null = null;
    if (CategoryID) {
      const found = await this.categoryRepo.findOne({ where: { CategoryID } });
      if (!found) throw new BadRequestException('Category không tồn tại.');
      category = found;
    }

    // ✅ Tạo ảnh (có thể không có)
    let savedOldImg: Images | null = null;
    let savedNewImg: Images | null = null;

    if (oldImage?.FilePath) {
      const oldImg = this.imageRepo.create({
        FilePath: oldImage.FilePath,
        AltText: oldImage.AltText ?? null,
        Type: 'historical',
      });
      savedOldImg = await this.imageRepo.save(oldImg);
    }

    if (newImage?.FilePath) {
      const newImg = this.imageRepo.create({
        FilePath: newImage.FilePath,
        AltText: newImage.AltText ?? null,
        Type: 'modern',
      });
      savedNewImg = await this.imageRepo.save(newImg);
    }

    // ✅ Tạo bản so sánh
    const comparison = this.compareRepo.create({
      Title,
      Description,
      YearOld,
      YearNew,
      Location,
      Category: category ? category.Name : null,
      OldImagePath: savedOldImg ? savedOldImg.FilePath : null,
      NewImagePath: savedNewImg ? savedNewImg.FilePath : null,
    } as Partial<ImageComparison>);
    
    const savedComparison = await this.compareRepo.save(comparison);
    return savedComparison as ImageComparison;
  }
}
