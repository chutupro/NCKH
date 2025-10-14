import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapLocation } from '../entities/map-location.entity';
import { CreateLocationDto } from '../models/dtos/create-location.dto';
import { LocationResponseDto } from '../models/dtos/location-response.dto';

/**
 * Map locations service
 */
@Injectable()
export class MapLocationsService {
  constructor(
    @InjectRepository(MapLocation)
    private readonly locationRepository: Repository<MapLocation>,
  ) {}

  /**
   * Creates new location
   */
  async createLocation(createLocationDto: CreateLocationDto): Promise<LocationResponseDto> {
    const location = this.locationRepository.create(createLocationDto);
    const savedLocation = await this.locationRepository.save(location);
    return this.mapToResponseDto(savedLocation);
  }

  /**
   * Gets location by ID
   */
  async getLocationById({ locationId }: { locationId: number }): Promise<LocationResponseDto> {
    const location = await this.locationRepository.findOne({ where: { locationId } });
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return this.mapToResponseDto(location);
  }

  /**
   * Gets all locations
   */
  async getAllLocations(): Promise<LocationResponseDto[]> {
    const locations = await this.locationRepository.find();
    return locations.map((location) => this.mapToResponseDto(location));
  }

  /**
   * Gets locations by article
   */
  async getLocationsByArticle({ articleId }: { articleId: number }): Promise<LocationResponseDto[]> {
    const locations = await this.locationRepository.find({
      where: { articleId },
    });
    return locations.map((location) => this.mapToResponseDto(location));
  }

  /**
   * Deletes location
   */
  async deleteLocation({ locationId }: { locationId: number }): Promise<void> {
    const result = await this.locationRepository.delete(locationId);
    if (!result.affected) {
      throw new NotFoundException('Location not found');
    }
  }

  /**
   * Maps location entity to response DTO
   */
  private mapToResponseDto(location: MapLocation): LocationResponseDto {
    return {
      locationId: location.locationId,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      description: location.description,
      timelineId: location.timelineId,
      articleId: location.articleId,
    };
  }
}

