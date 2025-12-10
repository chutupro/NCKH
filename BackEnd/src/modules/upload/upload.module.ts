import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { MediaClientService } from 'src/common/media-client.service';
import { ImagesService } from 'src/common/images.service';
import { Images } from '../entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Images])],
  controllers: [UploadController],
  providers: [MediaClientService, ImagesService],
})
export class UploadModule {}
