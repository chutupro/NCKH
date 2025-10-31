import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timelines } from '../entities/timeline.entity';
import { Images } from '../entities/image.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Timelines)
    private readonly timelineRepo: Repository<Timelines>,
    @InjectRepository(Images)
    private readonly imageRepo: Repository<Images>,
  ) {}

  async getTimelineItems(categories?: string[]) {
    const validCategories = ['Kiến trúc', 'Văn hóa', 'Du lịch', 'Thiên nhiên'];

    // 🔹 Lọc category hợp lệ nếu có
    if (categories) {
      categories = categories.filter((cat) => validCategories.includes(cat));
      if (categories.length === 0) return [];
    }

    // 🔹 Lấy dữ liệu timeline
    const timelines = await this.timelineRepo
      .createQueryBuilder('timeline')
      .where(categories ? 'timeline.Category IN (:...categories)' : '1=1', { categories })
      .orderBy('timeline.EventDate', 'ASC')
      .getMany();

    // 🔹 Lấy toàn bộ ảnh Type='timeline'
    const images = await this.imageRepo.find({ where: { Type: 'timeline' } });

    // 🔹 Map ảnh theo thứ tự timeline → image
    const items = timelines.map((tl, idx) => {
      const image = images.length > 0 ? images[idx % images.length] : null; // quay vòng nếu thiếu ảnh

      const dateStr = tl.EventDate
        ? (tl.EventDate instanceof Date ? tl.EventDate : new Date(tl.EventDate)).toISOString().slice(0, 10)
        : '';

      return {
        id: tl.TimelineID,
        date: dateStr,
        title: tl.Title,
        desc: tl.Description,
        image: image ? image.FilePath : null,
        category: tl.Category,
      };
    });

    return items;
  }
}