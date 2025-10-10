import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timeline } from '../entities/timeline.entity';
import { TimelineCreateDto } from './dto/Timeline.create';
import { TimelineUpdateDto } from './dto/Timeline.update';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Timeline)
    private readonly repo: Repository<Timeline>,
  ) {}

  async findAll() {
    return await this.repo.find({ relations: ['article'] });
  }

  async findByArticle(articleId: number) {
    return await this.repo.find({
      where: { ArticleID: articleId },
      order: { EventDate: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { TimelineID: id },
      relations: ['article'],
    });
    if (!item) throw new NotFoundException(`Không tìm thấy Timeline ID = ${id}`);
    return item;
  }

  async create(dto: TimelineCreateDto) {
    try {
      const entity = this.repo.create(dto as Partial<Timeline>);
      const saved = await this.repo.save(entity);
      return saved;
    } catch (error) {
      throw new BadRequestException('Không thể tạo Timeline. Dữ liệu không hợp lệ.');
    }
  }

  async update(id: number, dto: TimelineUpdateDto) {
    const existing = await this.repo.findOneBy({ TimelineID: id });
    if (!existing) throw new NotFoundException(`Timeline ${id} không tồn tại`);

    await this.repo.update({ TimelineID: id }, dto as Partial<Timeline>);
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.repo.findOneBy({ TimelineID: id });
    if (!existing) throw new NotFoundException(`Timeline ${id} không tồn tại`);

    await this.repo.delete({ TimelineID: id });
    return { deleted: true, id };
  }
}
