import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageComparisonsController } from './image-comparisons.controller';
import { ImageComparisonsService } from './image-comparisons.service';
import { ImageComparison } from '../entities/image-comparison.entity';
import { Categories } from '../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageComparison, Categories])],
  controllers: [ImageComparisonsController],
  providers: [ImageComparisonsService],
  exports: [ImageComparisonsService],
})
export class ImageComparisonsModule {}
