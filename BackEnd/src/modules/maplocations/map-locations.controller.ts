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
  ParseIntPipe,
  NotFoundException,
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

  // GET /map-locations
  @Get()
  findAll() {
    return this.mapLocationsService.findAll();
  }

  // POST /map-locations
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
        fileFilter: (req, file, cb) => {
          const allowedTypes = /jpeg|jpg|png|gif|webp/;
          const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(extname(file.originalname).toLowerCase());
          if (isValid) {
            cb(null, true);
          } else {
            cb(new BadRequestException(`File type không hợp lệ: ${file.originalname}`), false);
          }
        },
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
    this.logger.log('POST /map-locations - Raw FormData:', body);
    this.logger.log('Uploaded files:', files);

    // === XỬ LÝ CÁC TRƯỜNG BẮT BUỘC ===
    const title = body.title?.trim();
    const latitude = body.latitude ? parseFloat(body.latitude) : null;
    const longitude = body.longitude ? parseFloat(body.longitude) : null;
    const address = body.address?.trim() || null;

    if (!title || !latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Tiêu đề, tọa độ là bắt buộc và phải hợp lệ.');
    }

    // === XỬ LÝ CategoryID ===
    let categoryId: number | null = null;
    if (body.CategoryID) {
      const parsed = parseInt(body.CategoryID, 10);
      if (!isNaN(parsed) && parsed > 0) {
        categoryId = parsed;
      } else {
        this.logger.warn(`CategoryID không hợp lệ: ${body.CategoryID}`);
      }
    }

    // === XỬ LÝ ẢNH ===
    const imageUrl =
      files?.image?.[0] ? `/uploads/${files.image[0].filename}` : body.image || null;

    const oldImageUrl =
      files?.oldImage?.[0] ? `/uploads/${files.oldImage[0].filename}` : body.oldImage || null;

    // === TẠO DTO ===
    const dto = {
      title,
      latitude,
      longitude,
      address,
      image: imageUrl,
      oldImage: oldImageUrl,
      desc: body.desc?.trim() || null,
      fullDesc: body.fullDesc?.trim() || null,
      categoryId,
      rating: 0,
      reviews: 0,
    };

    this.logger.log('DTO gửi đến service:', dto);

    return this.mapLocationsService.create(dto);
  }

  // PUT /map-locations/:id
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
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      oldImage?: Express.Multer.File[];
    },
  ) {
    this.logger.log(`PUT /map-locations/${id} - Body:`, body);

    const imageUrl =
      files?.image?.[0]
        ? `/uploads/${files.image[0].filename}`
        : body.image || undefined;

    const oldImageUrl =
      files?.oldImage?.[0]
        ? `/uploads/${files.oldImage[0].filename}`
        : body.oldImage || undefined;

    let categoryId: number | null = null;
    if (body.CategoryID !== undefined) {
      const parsed = parseInt(body.CategoryID, 10);
      categoryId = !isNaN(parsed) && parsed > 0 ? parsed : null;
    }

    const dto = {
      title: body.title,
      latitude: body.latitude ? parseFloat(body.latitude) : undefined,
      longitude: body.longitude ? parseFloat(body.longitude) : undefined,
      address: body.address,
      image: imageUrl,
      oldImage: oldImageUrl,
      desc: body.desc,
      fullDesc: body.fullDesc,
      categoryId,
      rating: body.rating ? parseFloat(body.rating) : undefined,
      reviews: body.reviews ? parseInt(body.reviews, 10) : undefined,
    };

    const result = await this.mapLocationsService.update(id, dto);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy địa điểm với ID: ${id}`);
    }

    return result;
  }

  // DELETE /map-locations/:id
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.mapLocationsService.remove(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy địa điểm với ID: ${id}`);
    }
    return { message: `Đã xóa địa điểm ID: ${id}` };
  }

  // GET /map-locations/:id/feedback
  @Get(':id/feedback')
  getFeedback(@Param('id', ParseIntPipe) id: number) {
    return this.mapLocationsService.getFeedbackByLocation(id);
  }

  // POST /map-locations/:id/feedback
  @Post(':id/feedback')
  async addFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    feedbackDto: {
      rating: number;
      comment: string;
      userId: number;
    },
  ) {
    if (!feedbackDto.userId || !feedbackDto.rating || !feedbackDto.comment) {
      throw new BadRequestException('userId, rating, comment là bắt buộc');
    }

    return this.mapLocationsService.addFeedback(id, feedbackDto.userId, {
      rating: feedbackDto.rating,
      comment: feedbackDto.comment,
    });
  }
}