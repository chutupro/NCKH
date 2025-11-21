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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';
import { LocationImagesService } from './location-images.service';

@Controller('location-images')
export class LocationImagesController {
  constructor(private readonly svc: LocationImagesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const isValid =
          allowedTypes.test(file.mimetype) &&
          allowedTypes.test(extname(file.originalname).toLowerCase());
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
    },
    @UploadedFile() file: Express.Multer.File,
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

    return this.svc.create(
      { locationId, userId, year },
      `/uploads/${file.filename}`,
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



