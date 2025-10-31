// src/modules/maplocations/map-locations.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MapLocationsService } from './map-locations.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';

@Controller('map-locations')
export class MapLocationsController {
  private readonly logger = new Logger(MapLocationsController.name);

  constructor(private readonly mapLocationsService: MapLocationsService) {}

  @Get()
  findAll() {
    return this.mapLocationsService.findAll();
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'oldImage', maxCount: 1 },
      ],
      {
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
      },
    ),
  )
  async create(
    @Body() body: any,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      oldImage?: Express.Multer.File[];
    },
  ) {
    this.logger.log('POST /map-locations - Body:', body);
    this.logger.log('Uploaded files:', files);

    const imageUrl =
      files?.image?.[0] ? `/uploads/${files.image[0].filename}` : body.image || null;

    const oldImageUrl =
      files?.oldImage?.[0] ? `/uploads/${files.oldImage[0].filename}` : body.oldImage || null;

    const dto = {
      ...body,
      image: imageUrl,
      oldImage: oldImageUrl,
    };

    return this.mapLocationsService.create(dto);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'oldImage', maxCount: 1 },
      ],
      {
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
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      oldImage?: Express.Multer.File[];
    },
  ) {
    const imageUrl =
      files?.image?.[0]
        ? `/uploads/${files.image[0].filename}`
        : body.image || undefined;

    const oldImageUrl =
      files?.oldImage?.[0]
        ? `/uploads/${files.oldImage[0].filename}`
        : body.oldImage || undefined;

    const dto = {
      ...body,
      image: imageUrl,
      oldImage: oldImageUrl,
    };

    return this.mapLocationsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mapLocationsService.remove(+id);
  }

  @Get(':id/feedback')
  getFeedback(@Param('id') id: string) {
    return this.mapLocationsService.getFeedbackByLocation(+id);
  }

  @Post(':id/feedback')
  addFeedback(
    @Param('id') id: string,
    @Body() feedbackDto: { rating: number; comment: string; userId: number },
  ) {
    return this.mapLocationsService.addFeedback(+id, feedbackDto.userId, feedbackDto);
  }
}