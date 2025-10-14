import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEvent } from '../entities/location-event.entity';
import { CreateEventDto } from '../models/dtos/create-event.dto';

/**
 * Location events service
 */
@Injectable()
export class LocationEventsService {
  constructor(
    @InjectRepository(LocationEvent)
    private readonly eventRepository: Repository<LocationEvent>,
  ) {}

  /**
   * Creates new location event
   */
  async createEvent(createEventDto: CreateEventDto) {
    const event = this.eventRepository.create({
      ...createEventDto,
      eventDate: new Date(createEventDto.eventDate),
    });
    return this.eventRepository.save(event);
  }

  /**
   * Gets event by ID
   */
  async getEventById({ eventId }: { eventId: number }) {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['location'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  /**
   * Gets events by location
   */
  async getEventsByLocation({ locationId }: { locationId: number }) {
    return this.eventRepository.find({
      where: { locationId },
      order: { eventDate: 'ASC' },
    });
  }

  /**
   * Deletes event
   */
  async deleteEvent({ eventId }: { eventId: number }): Promise<void> {
    const result = await this.eventRepository.delete(eventId);
    if (!result.affected) {
      throw new NotFoundException('Event not found');
    }
  }
}

