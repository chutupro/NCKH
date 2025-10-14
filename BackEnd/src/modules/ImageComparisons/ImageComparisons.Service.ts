import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageComparison } from '../entities/image-comparisons.entity';
import { ImageComparisonCreateDto } from './dto/ImageComparisonCreateDto';
import { ImageComparisonUpdateDto } from './dto/ImageComparisonUpdateDto';

@Injectable()
export class ImageComparisonService {
  constructor(
    @InjectRepository(ImageComparison)
    private readonly repo: Repository<ImageComparison>,
  ) {}

  async findAll() {
    return await this.repo.find({ relations: ['ArticleID', 'HistoricalImageID', 'ModernImageID'] });
  }

  async findByArticle(articleId: number) {
    return await this.repo.find({
      where: { ArticleID: { ArticleID: articleId } },
      order: { ComparisonID: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { ComparisonID: id },
      relations: ['ArticleID', 'HistoricalImageID', 'ModernImageID'],
    });
    if (!item) throw new NotFoundException(`Không tìm thấy ImageComparison ID = ${id}`);
    return item;
  }

  async create(dto: ImageComparisonCreateDto) {
    try {
      const entity = this.repo.create(dto as Partial<ImageComparison>);
      const saved = await this.repo.save(entity);
      return saved;
    } catch (error) {
      throw new BadRequestException('Không thể tạo ImageComparison. Dữ liệu không hợp lệ.');
    }
  }

  async update(id: number, dto: ImageComparisonUpdateDto) {
    const existing = await this.repo.findOneBy({ ComparisonID: id });
    if (!existing) throw new NotFoundException(`ImageComparison ${id} không tồn tại`);

    await this.repo.update({ ComparisonID: id }, dto as Partial<ImageComparison>);
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.repo.findOneBy({ ComparisonID: id });
    if (!existing) throw new NotFoundException(`ImageComparison ${id} không tồn tại`);

    await this.repo.delete({ ComparisonID: id });
    return { deleted: true, id };
  }
}