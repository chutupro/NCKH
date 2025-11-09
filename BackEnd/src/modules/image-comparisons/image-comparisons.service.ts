import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageComparison } from '../entities/image-comparison.entity';
import { Categories } from '../entities/category.entity';

@Injectable()
export class ImageComparisonsService {
  constructor(
    @InjectRepository(ImageComparison) private compRepo: Repository<ImageComparison>,
    @InjectRepository(Categories) private categoryRepo: Repository<Categories>,
  ) {}

  async create(payload: Partial<ImageComparison>) {
    const ent = this.compRepo.create(payload as ImageComparison);
    const saved = await this.compRepo.save(ent);
    return this.findOne(saved.ComparisonID);
  }

  async findAll() {
    const items = await this.compRepo.find({ relations: ['category'] });
    return items.map((c) => ({
      ComparisonID: c.ComparisonID,
      Title: c.Title,
      Description: c.Description,
      YearOld: c.YearOld,
      YearNew: c.YearNew,
      CategoryID: c.CategoryID,
      Category: c.category ? { CategoryID: c.category.CategoryID, Name: c.category.Name } : null,
      OldImagePath: c.OldImagePath,
      NewImagePath: c.NewImagePath,
      Location: c.Address,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async findOne(id: number) {
    const c = await this.compRepo.findOne({ where: { ComparisonID: id }, relations: ['category'] });
    if (!c) return null;
    return {
      ComparisonID: c.ComparisonID,
      Title: c.Title,
      Description: c.Description,
      YearOld: c.YearOld,
      YearNew: c.YearNew,
      CategoryID: c.CategoryID,
      Category: c.category ? { CategoryID: c.category.CategoryID, Name: c.category.Name } : null,
      OldImagePath: c.OldImagePath,
      NewImagePath: c.NewImagePath,
      Location: c.Address,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
