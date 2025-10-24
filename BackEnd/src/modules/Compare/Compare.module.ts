import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageComparison } from '../entities/image-comparison.entity';
import { Images } from '../entities/image.entity';
import { Categories } from '../entities/category.entity';
import { CompareController } from './Compare.controller';
import { CompareService } from './Compare.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImageComparison, Images, Categories])],
  controllers: [CompareController],
  providers: [CompareService],
  exports: [CompareService],
})
export class CompareModule {}
