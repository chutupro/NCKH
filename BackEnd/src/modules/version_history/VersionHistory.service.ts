import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionHistoryCreateDto } from './dto/VersionHistory.create';
import { VersionHistoryUpdateDto } from './dto/VersionHistory.update';
import { VersionHistory } from '../entities';

@Injectable()
export class VersionHistoryService {
  constructor(
    @InjectRepository(VersionHistory)
    private readonly repo: Repository<VersionHistory>,
  ) {}

  async findAll() {
    const result = await this.repo.find();
    return result;
  }

  async findOne(id: number) {
    const item = await this.repo.findOneBy({ VersionHistoryID: id } as any);
    if (!item) throw new NotFoundException(`Không tìm thấy VersionHistory ID = ${id}`);
    return item;
  }

  async create(dto: VersionHistoryCreateDto) {
    try {
      const entity = this.repo.create(dto as Partial<VersionHistory>);
      const saved = await this.repo.save(entity);
      return saved;
    } catch (error) {
      throw new BadRequestException('Không thể tạo VersionHistory. Kiểm tra dữ liệu đầu vào.');
    }
  }

  async update(id: number, dto: VersionHistoryUpdateDto) {
    const existing = await this.repo.findOneBy({ VersionHistoryID: id } as any);
    if (!existing) throw new NotFoundException(`VersionHistory ${id} không tồn tại`);

    await this.repo.update({ VersionHistoryID: id } as any, dto as Partial<VersionHistory>);
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.repo.findOneBy({ VersionHistoryID: id } as any);
    if (!existing) throw new NotFoundException(`VersionHistory ${id} không tồn tại`);

    await this.repo.delete({ VersionHistoryID: id } as any);
    return { deleted: true, id };
  }
}
