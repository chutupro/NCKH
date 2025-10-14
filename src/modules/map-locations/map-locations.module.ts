import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapLocationsService } from './services/map-locations.service';
import { LocationEventsService } from './services/location-events.service';
import { MapLocationsController } from './controllers/map-locations.controller';
import { MapLocation } from './entities/map-location.entity';
import { LocationEvent } from './entities/location-event.entity';

/**
 * Map locations module
 */
@Module({
  imports: [TypeOrmModule.forFeature([MapLocation, LocationEvent])],
  providers: [MapLocationsService, LocationEventsService],
  controllers: [MapLocationsController],
  exports: [MapLocationsService, LocationEventsService],
})
export class MapLocationsModule {}

