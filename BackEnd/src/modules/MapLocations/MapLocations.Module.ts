import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapLocationService } from './MapLocations.Service';
import { MapLocationController } from './MapLocations.Controller';
import { MapLocation } from '../entities/map-locations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapLocation])],
  controllers: [MapLocationController],
  providers: [MapLocationService],
  exports: [MapLocationService],
})
export class MapLocationModule {}