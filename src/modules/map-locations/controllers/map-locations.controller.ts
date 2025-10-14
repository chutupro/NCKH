import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MapLocationsService } from '../services/map-locations.service';
import { LocationEventsService } from '../services/location-events.service';
import { CreateLocationDto } from '../models/dtos/create-location.dto';
import { CreateEventDto } from '../models/dtos/create-event.dto';
import { Public } from '../../../core/decorators/public.decorator';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Map locations controller
 */
@ApiTags('Map Locations')
@ApiBearerAuth()
@Controller('map-locations')
export class MapLocationsController {
  constructor(
    private readonly locationsService: MapLocationsService,
    private readonly eventsService: LocationEventsService,
  ) {}

  /**
   * Create location
   */
  @Post()
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Create map location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  async createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.createLocation(createLocationDto);
  }

  /**
   * Get all locations
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  async getAllLocations() {
    return this.locationsService.getAllLocations();
  }

  /**
   * Get location by ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({ status: 200, description: 'Location retrieved successfully' })
  async getLocationById(@Param('id', ParseIntPipe) locationId: number) {
    return this.locationsService.getLocationById({ locationId });
  }

  /**
   * Create location event
   */
  @Post('events')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Create location event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  /**
   * Get events by location
   */
  @Public()
  @Get(':id/events')
  @ApiOperation({ summary: 'Get events by location' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getEventsByLocation(@Param('id', ParseIntPipe) locationId: number) {
    return this.eventsService.getEventsByLocation({ locationId });
  }

  /**
   * Delete location
   */
  @Delete(':id')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Delete location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  async deleteLocation(@Param('id', ParseIntPipe) locationId: number) {
    await this.locationsService.deleteLocation({ locationId });
    return { message: 'Location deleted successfully' };
  }

  /**
   * Smoke test endpoint for admin
   */
  @Get('admin/test')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Admin smoke test' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return { message: 'Map locations admin test successful' };
  }
}

