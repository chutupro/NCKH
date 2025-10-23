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

    // Lọc category hợp lệ
    if (categories) {
      categories = categories.filter(cat => validCategories.includes(cat));
      if (categories.length === 0) return [];
    }

    const query = this.timelineRepo.createQueryBuilder('timeline');

    if (categories) {
      query.where('timeline.Category IN (:...categories)', { categories });
    }

    const timelines = await query.orderBy('timeline.EventDate', 'ASC').getMany();

    const items = await Promise.all(
      timelines.map(async (tl) => {
        const image = await this.imageRepo.findOne({ where: { ArticleID: tl.ArticleID } });

        let dateStr = '';
        if (tl.EventDate) {
          const eventDate = tl.EventDate instanceof Date ? tl.EventDate : new Date(tl.EventDate);
          dateStr = eventDate.toISOString().slice(0, 10);
        }

        return {
          id: tl.TimelineID,
          date: dateStr,
          title: tl.Title,
          desc: tl.Description,
          image: image ? image.FilePath : null,
          category: tl.Category,
        };
      }),
    );

    return items;
  }
}
