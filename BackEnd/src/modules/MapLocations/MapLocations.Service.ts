import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapLocation } from '../entities/map-locations.entity';
import { MapLocationCreateDto } from './dto/MapLocationCreateDto';
import { MapLocationUpdateDto } from './dto/MapLocationUpdateDto';

@Injectable()
export class MapLocationService {
  constructor(
    @InjectRepository(MapLocation)
    private readonly repo: Repository<MapLocation>,
  ) {}

  async findAll() {
    return await this.repo.find({ relations: ['ArticleID', 'TimelineID'] });
  }

  async findByArticle(articleId: number) {
    return await this.repo.find({
      where: { ArticleID: { ArticleID: articleId } },
      order: { LocationID: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { LocationID: id },
      relations: ['ArticleID', 'TimelineID'],
    });
    if (!item) throw new NotFoundException(`Không tìm thấy MapLocation ID = ${id}`);
    return item;
  }

  async create(dto: MapLocationCreateDto) {
    try {
      const entity = this.repo.create(dto as Partial<MapLocation>);
      const saved = await this.repo.save(entity);
      return saved;
    } catch (error) {
      throw new BadRequestException('Không thể tạo MapLocation. Dữ liệu không hợp lệ.');
    }
  }

  async update(id: number, dto: MapLocationUpdateDto) {
    const existing = await this.repo.findOneBy({ LocationID: id });
    if (!existing) throw new NotFoundException(`MapLocation ${id} không tồn tại`);

    await this.repo.update({ LocationID: id }, dto as Partial<MapLocation>);
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.repo.findOneBy({ LocationID: id });
    if (!existing) throw new NotFoundException(`MapLocation ${id} không tồn tại`);

    await this.repo.delete({ LocationID: id });
    return { deleted: true, id };
  }
}