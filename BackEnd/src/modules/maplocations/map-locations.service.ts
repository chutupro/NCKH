import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapLocations } from '../entities/map-location.entity';
import { Feedback } from '../entities/feedback.entity';

@Injectable()
export class MapLocationsService {
  private readonly logger = new Logger(MapLocationsService.name);

  constructor(
    @InjectRepository(MapLocations)
    private mapLocationsRepository: Repository<MapLocations>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async findAll() {
    return await this.mapLocationsRepository.find({
      relations: ['category'],
    });
  }

  async create(createLocationDto: any) {
    this.logger.log('Creating location with DTO:', createLocationDto);

    if (!createLocationDto.latitude || !createLocationDto.longitude || !createLocationDto.title || !createLocationDto.address) {
      throw new BadRequestException('Title, address, latitude, and longitude are required');
    }

    const newLocation = this.mapLocationsRepository.create({
      Name: createLocationDto.title,
      Latitude: createLocationDto.latitude,
      Longitude: createLocationDto.longitude,
      Rating: createLocationDto.rating ?? 0,
      Reviews: createLocationDto.reviews ?? 0,
      Address: createLocationDto.address,
      Image: createLocationDto.image || null,
      OldImage: createLocationDto.oldImage || null,
      Desc: createLocationDto.desc || null,
      FullDesc: createLocationDto.fullDesc || null,
      ArticleID: createLocationDto.articleId ?? null,
      TimelineID: createLocationDto.timelineId ?? null,
      CategoryID: createLocationDto.CategoryID ? parseInt(createLocationDto.CategoryID, 10) : null, // SỬA
    } as MapLocations); // ÉP KIỂU ĐÚNG

    try {
      const savedLocation = await this.mapLocationsRepository.save(newLocation);
      this.logger.log('Location saved successfully:', savedLocation);
      return savedLocation;
    } catch (error) {
      this.logger.error('Error saving location:', error);
      throw new BadRequestException(`Failed to save location: ${error.message}`);
    }
  }

  async update(id: number, updateLocationDto: any) {
    const location = await this.mapLocationsRepository.findOneBy({ LocationID: id });
    if (!location) return null;

    Object.assign(location, {
      Name: updateLocationDto.title || location.Name,
      Latitude: updateLocationDto.latitude ?? location.Latitude,
      Longitude: updateLocationDto.longitude ?? location.Longitude,
      Address: updateLocationDto.address || location.Address,
      Image: updateLocationDto.image || location.Image,
      OldImage: updateLocationDto.oldImage || location.OldImage,
      Desc: updateLocationDto.desc || location.Desc,
      FullDesc: updateLocationDto.fullDesc || location.FullDesc,
      ArticleID: updateLocationDto.articleId ?? location.ArticleID,
      TimelineID: updateLocationDto.timelineId ?? location.TimelineID,
      CategoryID: updateLocationDto.CategoryID ? parseInt(updateLocationDto.CategoryID, 10) : location.CategoryID,
    });

    return await this.mapLocationsRepository.save(location);
  }

  async remove(id: number) {
    const result = await this.mapLocationsRepository.delete(id);
    return result.affected ? id : null;
  }

  async getFeedbackByLocation(locationId: number) {
    return await this.feedbackRepository.find({
      where: { LocationID: locationId },
      relations: ['user'],
      order: { CreatedAt: 'DESC' },
    });
  }

  async addFeedback(locationId: number, userId: number, feedbackDto: { rating: number; comment: string }) {
    if (!feedbackDto.rating || !feedbackDto.comment) {
      throw new BadRequestException('Rating and comment are required');
    }

    const location = await this.mapLocationsRepository.findOneBy({ LocationID: locationId });
    if (!location) throw new BadRequestException('Location not found');

    const feedback = this.feedbackRepository.create({
      LocationID: locationId,
      UserID: userId,
      Rating: feedbackDto.rating,
      Comment: feedbackDto.comment,
      CreatedAt: new Date(),
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    const feedbacks = await this.feedbackRepository.find({ where: { LocationID: locationId } });
    const avg = feedbacks.reduce((s, f) => s + f.Rating, 0) / feedbacks.length || 0;
    location.Rating = parseFloat(avg.toFixed(1));
    location.Reviews = feedbacks.length;
    await this.mapLocationsRepository.save(location);

    return savedFeedback;
  }
}