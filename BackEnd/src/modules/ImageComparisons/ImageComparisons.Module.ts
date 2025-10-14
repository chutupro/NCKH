import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageComparisonService } from './ImageComparisons.Service';
import { ImageComparisonController } from './ImageComparisons.Controller';
import { ImageComparison } from '../entities/image-comparisons.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageComparison])],
  controllers: [ImageComparisonController],
  providers: [ImageComparisonService],
  exports: [ImageComparisonService],
})
export class ImageComparisonModule {}