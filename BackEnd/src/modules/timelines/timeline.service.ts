import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timelines } from '../entities/timeline.entity';
import { Images } from '../entities/image.entity';
import { MapLocations } from '../entities/map-location.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Timelines)
    private timelineRepo: Repository<Timelines>,
    @InjectRepository(Images)
    private imagesRepo: Repository<Images>,
    @InjectRepository(MapLocations)
    private locationsRepo: Repository<MapLocations>,
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
      timelineID: t.timelineID,
      title: t.title,
      eventDate: t.eventDate,
      description: t.description,
      ImageID: t.ImageID,
      LocationID: t.LocationID,
      sourceUrl: t.sourceUrl,
    }));
  }

  // Lấy chi tiết timeline theo ID
  async getTimelineItemById(id: number) {
    const t = await this.timelineRepo.findOne({
      where: { timelineID: id },
    });

    if (!t) return null;

    return {
      timelineID: t.timelineID,
      title: t.title,
      eventDate: t.eventDate,
      description: t.description,
      ImageID: t.ImageID,
      LocationID: t.LocationID,
      sourceUrl: t.sourceUrl,
    };
  }

  // CREATE
  async create(data: any) {
    // Validate ImageID exists
    const imageExists = await this.imagesRepo.findOne({ where: { ImageID: data.ImageID } });
    if (!imageExists) {
      throw new BadRequestException(`ImageID ${data.ImageID} không tồn tại`);
    }

    // Validate LocationID exists (chỉ khi có)
    if (data.LocationID) {
      const locationExists = await this.locationsRepo.findOne({ where: { LocationID: data.LocationID } });
      if (!locationExists) {
        throw new BadRequestException(`LocationID ${data.LocationID} không tồn tại`);
      }
    }

    const newTimeline = new Timelines();
    newTimeline.ImageID = data.ImageID;
    newTimeline.LocationID = data.LocationID || null; // Có thể null
    newTimeline.title = data.title;
    newTimeline.eventDate = data.eventDate;
    newTimeline.description = data.description || null;
    newTimeline.sourceUrl = data.sourceUrl || null;
    newTimeline.status = data.status || 'pending';

    const saved = await this.timelineRepo.save(newTimeline);
    return saved;
  }

  // UPDATE
  async update(id: number, data: any) {
    const timeline = await this.timelineRepo.findOne({ where: { timelineID: id } });
    if (!timeline) {
      throw new NotFoundException(`Timeline #${id} không tồn tại`);
    }

    // Validate ImageID if changed
    if (data.ImageID && data.ImageID !== timeline.ImageID) {
      const imageExists = await this.imagesRepo.findOne({ where: { ImageID: data.ImageID } });
      if (!imageExists) {
        throw new BadRequestException(`ImageID ${data.ImageID} không tồn tại`);
      }
      timeline.ImageID = data.ImageID;
    }

    // Validate LocationID if changed
    if (data.LocationID && data.LocationID !== timeline.LocationID) {
      const locationExists = await this.locationsRepo.findOne({ where: { LocationID: data.LocationID } });
      if (!locationExists) {
        throw new BadRequestException(`LocationID ${data.LocationID} không tồn tại`);
      }
      timeline.LocationID = data.LocationID;
    }

    if (data.title) timeline.title = data.title;
    if (data.eventDate) timeline.eventDate = data.eventDate;
    if (data.description !== undefined) timeline.description = data.description;
    if (data.sourceUrl !== undefined) timeline.sourceUrl = data.sourceUrl;
    if (data.status) timeline.status = data.status;

    const updated = await this.timelineRepo.save(timeline);
    return updated;
  }

  // DELETE
  async delete(id: number) {
    const timeline = await this.timelineRepo.findOne({ where: { timelineID: id } });
    if (!timeline) {
      throw new NotFoundException(`Timeline #${id} không tồn tại`);
    }
    await this.timelineRepo.remove(timeline);
  }
}
