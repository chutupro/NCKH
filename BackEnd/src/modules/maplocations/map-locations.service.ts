// src/modules/maplocations/map-locations.service.ts
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
  try {
    const locations = await this.mapLocationsRepository
      .createQueryBuilder('loc')
      .leftJoin('loc.mainImage', 'mainImg')
      .leftJoin('mainImg.collection', 'mainCol')
      .leftJoin('mainImg.category', 'mainCat')
      .leftJoin('loc.oldImage', 'oldImg')
      .leftJoin('oldImg.collection', 'oldCol')
      .leftJoin('oldImg.category', 'oldCat')
      .select([
        'loc.LocationID',
        'loc.Name',
        'loc.Latitude',
        'loc.Longitude',
        'loc.Address',
        'loc.MainImageID',
        'loc.OldImageID',
        'loc.ArticleID',
        'loc.Rating',
        'loc.Reviews',
        'mainImg.FilePath',
        'mainImg.ImageID',
        'mainImg.CollectionID',
        'mainImg.CategoryID',
        'mainCat.Name',
        'mainCol.Year',
        'oldImg.FilePath',
        'oldImg.ImageID',
        'oldImg.CollectionID',
        'oldImg.CategoryID',
        'oldCat.Name',
        'oldCol.Year',
      ])
      .addSelect('loc.Desc', 'description')
      .addSelect('loc.FullDesc', 'fullDescription')
      .getRawMany();

    // Debug log location 17 (newest with images)
    const loc17 = locations.find(l => l.loc_LocationID === 17);
    if (loc17) {
      this.logger.log('🎯 [findAll] LocationID=17 (NEW):', JSON.stringify(loc17, null, 2));
    }

    return locations.map(loc => {
      // Ưu tiên category từ modern image, fallback sang old image
      const categoryId = loc.mainImg_CategoryID || loc.oldImg_CategoryID || null;
      const categoryName = loc.mainCat_Name || loc.oldCat_Name || null;
      
      const mapped = {
        LocationID: loc.loc_LocationID,
        Name: loc.loc_Name,
        Latitude: parseFloat(loc.loc_Latitude) || null,
        Longitude: parseFloat(loc.loc_Longitude) || null,
        Address: loc.loc_Address,
        MainImageID: loc.loc_MainImageID,
        OldImageID: loc.loc_OldImageID,
        CategoryID: categoryId,
        CategoryName: categoryName,
        Image: loc.mainImg_FilePath || null,
        ImageYear: loc.mainCol_Year || null,
        OldImage: loc.oldImg_FilePath || null,
        OldImageYear: loc.oldCol_Year || null,
        description: loc.description,
        fullDescription: loc.fullDescription,
        Rating: parseFloat(loc.loc_Rating) || null,
        Reviews: loc.loc_Reviews,
      };
      
      if (loc.loc_LocationID === 17) {
        this.logger.log('✅ [findAll] Mapped LocationID=17:', JSON.stringify(mapped, null, 2));
      }
      
      return mapped;
    });
  } catch (error) {
    this.logger.error('Error in findAll():', error);
    throw error;
  }
}

  async create(createLocationDto: any) {
    this.logger.log('Creating location with DTO:', createLocationDto);

    if (
      !createLocationDto.latitude ||
      !createLocationDto.longitude ||
      !createLocationDto.title ||
      !createLocationDto.address
    ) {
      throw new BadRequestException('Title, address, latitude, and longitude are required');
    }

    const newLocation = new MapLocations();
    newLocation.Name = createLocationDto.title;
    newLocation.Latitude = createLocationDto.latitude;
    newLocation.Longitude = createLocationDto.longitude;
    newLocation.Rating = createLocationDto.rating ?? 0;
    newLocation.Reviews = createLocationDto.reviews ?? 0;
    newLocation.Address = createLocationDto.address;
    newLocation.MainImageID = createLocationDto.mainImageID || null;
    newLocation.OldImageID = createLocationDto.oldImageID || null;
    newLocation.description = createLocationDto.desc || null;
    newLocation.fullDescription = createLocationDto.fullDesc || null;
    newLocation.ArticleID = createLocationDto.articleId ?? null;

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
      // MainImageID/OldImageID: TODO - Assign from Images table
      description: updateLocationDto.desc || location.description,
      fullDescription: updateLocationDto.fullDesc || location.fullDescription,
      ArticleID: updateLocationDto.articleId ?? location.ArticleID,
      Rating: updateLocationDto.rating ?? location.Rating,
      Reviews: updateLocationDto.reviews ?? location.Reviews,
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
      relations: ['user', 'user.profile'], // ✅ Load user profile để lấy Avatar
      order: { CreatedAt: 'DESC' },
    });
  }

  async addFeedback(locationId: number, userId: number, feedbackDto: { rating: number; comment: string; imageUrls?: string[] }) {
    if (!feedbackDto.rating || !feedbackDto.comment) {
      throw new BadRequestException('Rating and comment are required');
    }

    const location = await this.mapLocationsRepository.findOneBy({ LocationID: locationId });
    if (!location) throw new BadRequestException('Location not found');

    // ✅ Convert imageUrls array to JSON string
    const imageUrlsJson = feedbackDto.imageUrls && feedbackDto.imageUrls.length > 0
      ? JSON.stringify(feedbackDto.imageUrls)
      : undefined;

    const feedback = this.feedbackRepository.create({
      LocationID: locationId,
      UserID: userId,
      Rating: feedbackDto.rating,
      Comment: feedbackDto.comment,
      ImageUrls: imageUrlsJson, // ✅ Store image paths as JSON
      ImagesApproved: false,     // ✅ Default to false (pending admin approval)
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

  // ✅ Like feedback
  async likeFeedback(feedbackId: number) {
    const feedback = await this.feedbackRepository.findOneBy({ FeedbackID: feedbackId });
    if (!feedback) {
      throw new BadRequestException('Feedback not found');
    }

    feedback.Likes = (feedback.Likes || 0) + 1;
    await this.feedbackRepository.save(feedback);

    return { 
      message: 'Liked successfully', 
      likes: feedback.Likes 
    };
  }

  // ✅ Unlike feedback
  async unlikeFeedback(feedbackId: number) {
    const feedback = await this.feedbackRepository.findOneBy({ FeedbackID: feedbackId });
    if (!feedback) {
      throw new BadRequestException('Feedback not found');
    }

    feedback.Likes = Math.max(0, (feedback.Likes || 0) - 1);
    await this.feedbackRepository.save(feedback);

    return { 
      message: 'Unliked successfully', 
      likes: feedback.Likes 
    };
  }
}