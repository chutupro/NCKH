import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { LocationImagesService } from './location-images.service';
import { MediaClientService } from 'src/common/media-client.service';
import { ImagesService } from 'src/common/images.service';

@Controller('location-images')
export class LocationImagesController {
  constructor(
    private readonly svc: LocationImagesService,
    private readonly mediaClient: MediaClientService,
    private readonly imagesService: ImagesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: require('multer').memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const isValid =
          allowedTypes.test(file.mimetype) &&
          allowedTypes.test(file.originalname.toLowerCase());
        if (isValid) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`File không hợp lệ: ${file.originalname}`), false);
        }
      },
    }),
  )
  async create(
    @Body()
    body: {
      locationId: string;
      userId?: string;
      year?: string;
      category?: string;
    },
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Ảnh là bắt buộc');
    }
    const locationId = parseInt(body.locationId, 10);
    if (isNaN(locationId)) {
      throw new BadRequestException('locationId không hợp lệ');
    }

    const userId = body.userId ? parseInt(body.userId, 10) : undefined;
    const year = body.year ? parseInt(body.year, 10) : undefined;

    // Upload to media-service
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const category = body.category || 'van-hoa';
    
    const uploadResult = await this.mediaClient.uploadToMediaService(
      file,
      token,
      'post',
      category,
    );

    // Save to DB Images
    await this.imagesService.create(
      uploadResult.url,
      undefined,
      `Location image for ${locationId}`,
      'location',
    );

    return this.svc.create(
      { locationId, userId, year },
      uploadResult.url,
    );
  }

  @Get('location/:locationId')
  findApprovedByLocation(@Param('locationId') locationId: string) {
    const id = parseInt(locationId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('locationId không hợp lệ');
    }
    return this.svc.findApprovedByLocation(id);
  }

  @Get('pending')
  findPending() {
    return this.svc.findPending();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending' | 'approved' | 'rejected' },
  ) {
    const submissionId = parseInt(id, 10);
    if (isNaN(submissionId)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    return this.svc.updateStatus(submissionId, body.status);
  }
}



