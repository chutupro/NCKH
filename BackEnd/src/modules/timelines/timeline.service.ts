import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timelines } from '../entities/timeline.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Timelines)
    private timelineRepo: Repository<Timelines>,
  ) {}

  // Lấy danh sách timeline, hỗ trợ filter categories, fromYear, toYear
  async getTimelineItems(categories?: string[], fromYear?: string, toYear?: string) {
    const query = this.timelineRepo.createQueryBuilder('t');

    if (categories && categories.length > 0) {
      query.andWhere('t.category IN (:...categories)', { categories });
    }

    if (fromYear || toYear) {
      const start = fromYear ? `${fromYear}-01-01` : '0001-01-01';
      const end = toYear ? `${toYear}-12-31` : '9999-12-31';
      query.andWhere('t.eventDate BETWEEN :start AND :end', { start, end });
    }

    query.orderBy('t.eventDate', 'ASC');
    const data = await query.getMany();

    return data.map(t => ({
      id: t.timelineID,
      date: t.eventDate,
      title: t.title,
      desc: t.description?.slice(0, 200) || 'Không có mô tả ngắn.',
      image: t.image || `https://picsum.photos/seed/${t.timelineID}/800/400`,
      category: t.category,
      fullDesc: t.description,
      sourceUrl: t.sourceUrl,
    }));
  }

  // Lấy chi tiết timeline theo ID
  async getTimelineItemById(id: number) {
    const t = await this.timelineRepo.findOne({
      where: { timelineID: id },
      relations: ['categoryEntity'], // nếu có quan hệ
    });

    if (!t) return null;

    return {
      id: t.timelineID,
      date: t.eventDate,
      title: t.title,
      desc: t.description || 'Không có mô tả chi tiết.',
      image: t.image || `https://picsum.photos/seed/${t.timelineID}/1200/600`,
      category: t.category,
      fullDesc: t.description,
      sourceUrl: t.sourceUrl,
    };
  }
}
