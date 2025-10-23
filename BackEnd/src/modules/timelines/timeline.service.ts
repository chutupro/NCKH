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

  // Lấy timeline + ảnh, trả về đúng cấu trúc frontend cần
  async getTimelineItems() {
    const timelines = await this.timelineRepo.find({
      order: { EventDate: 'ASC' },
    });

    const items = await Promise.all(
      timelines.map(async (tl) => {
        const image = await this.imageRepo.findOne({
          where: { ArticleID: tl.ArticleID },
        });

        return {
          id: tl.TimelineID,
          date: tl.EventDate ? tl.EventDate.toString().slice(0, 4) : '',
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
