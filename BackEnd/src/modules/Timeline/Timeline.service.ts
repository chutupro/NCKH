import { Injectable, NotFoundException } from '@nestjs/common';
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

  findAll(): Promise<Timeline[]> {
    return this.repo.find({ relations: ['article'] });
  }

  findByArticle(articleId: number): Promise<Timeline[]> {
    return this.repo.find({
      where: { ArticleID: articleId },
      order: { EventDate: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Timeline> {
    const item = await this.repo.findOne({
      where: { TimelineID: id },
      relations: ['article'],
    });
    if (!item) throw new NotFoundException(`Timeline ${id} not found`);
    return item;
  }

  create(dto: TimelineCreateDto): Promise<Timeline> {
    const entity = this.repo.create(dto as Partial<Timeline>);
    return this.repo.save(entity);
  }

  async update(id: number, dto: TimelineUpdateDto): Promise<Timeline> {
    await this.repo.update({ TimelineID: id }, dto as Partial<Timeline>);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete({ TimelineID: id });
    return { deleted: true, id };
  }
}