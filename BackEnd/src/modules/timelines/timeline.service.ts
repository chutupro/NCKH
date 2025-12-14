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
    const query = this.timelineRepo.createQueryBuilder('t')
      .leftJoinAndSelect('t.image', 'img')
      .leftJoinAndSelect('img.category', 'cat')
      .leftJoinAndSelect('img.collection', 'col')
      .where('t.status = :status', { status: 'approved' });

    if (categories && categories.length > 0 && !categories.includes('all')) {
      query.andWhere('cat.Name IN (:...categories)', { categories });
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
      title: t.title, // Tiêu đề sự kiện timeline
      date: t.eventDate, // Ngày sự kiện
      desc: t.description || '',
      image: t.image?.FilePath || '',
      category: t.image?.category?.Name || 'Khác',
      // Thông tin ảnh gốc từ Gallery
      imageTitle: t.image?.AltText || '', // Tiêu đề ảnh gốc
      imageCategory: t.image?.category?.Name || 'Khác', // Thể loại ảnh
      collectionName: t.image?.collection?.Title || t.image?.collection?.Name || '', // Tên bộ sưu tập
      timelineID: t.timelineID,
      ImageID: t.ImageID,
      LocationID: t.LocationID,
      sourceUrl: t.sourceUrl,
    }));
  }

  // Lấy chi tiết timeline theo ID
  async getTimelineItemById(id: number) {
    const t = await this.timelineRepo.findOne({
      where: { timelineID: id },
      relations: ['image', 'image.category', 'image.collection', 'location'],
    });

    if (!t) return null;

    return {
      id: t.timelineID,
      title: t.title, // Tiêu đề sự kiện
      date: t.eventDate, // Ngày sự kiện
      desc: t.description || '',
      image: t.image?.FilePath || '',
      category: t.image?.category?.Name || 'Khác',
      // Thông tin ảnh gốc từ Gallery
      imageTitle: t.image?.AltText || '', // Tiêu đề ảnh gốc
      imageCategory: t.image?.category?.Name || 'Khác', // Thể loại ảnh
      collectionName: t.image?.collection?.Title || t.image?.collection?.Name || '', // Tên bộ sưu tập
      location: t.location ? {
        LocationID: t.location.LocationID,
        Name: t.location.Name,
        Latitude: t.location.Latitude,
        Longitude: t.location.Longitude,
      } : null,
      sourceUrl: t.sourceUrl,
      timelineID: t.timelineID,
      ImageID: t.ImageID,
      LocationID: t.LocationID,
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

  // DELETE - Xóa timeline entry (KHÔNG xóa ảnh gốc)
  async delete(id: number) {
    const timeline = await this.timelineRepo.findOne({ where: { timelineID: id } });
    if (!timeline) {
      throw new NotFoundException(`Timeline #${id} không tồn tại`);
    }

    // Chỉ xóa timeline entry, giữ nguyên ảnh trong Gallery
    await this.timelineRepo.remove(timeline);
    console.log(`[Timeline] ✅ Đã xóa Timeline #${id} (giữ nguyên Image #${timeline.ImageID})`);
  }
}
