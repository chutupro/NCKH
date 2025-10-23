import { Injectable } from '@nestjs/common';
import { TIMELINE_ITEMS } from './data/data.timeline'; 

@Injectable()
export class TimelineService {
  private readonly timelines = TIMELINE_ITEMS;

  findAll() {
    return this.timelines;
  }

  findByCategory(category: string) {
    return this.timelines.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  findById(id: number) {
    return this.timelines.find((item) => item.id === id);
  }
}
