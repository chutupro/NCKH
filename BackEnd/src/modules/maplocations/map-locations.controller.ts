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
  Req,
} from '@nestjs/common';
import { MapLocationsService } from './map-locations.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { MediaClientService } from 'src/common/media-client.service';
import { ImagesService } from 'src/common/images.service';

const normalizeYearInput = (val?: string | number) => {
  if (val === undefined || val === null || val === '') return undefined;
  const parsed = typeof val === 'number' ? val : parseInt(val, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

@Controller('map-locations')
export class MapLocationsController {
  private readonly logger = new Logger(MapLocationsController.name);

  constructor(
    private readonly mapLocationsService: MapLocationsService,
    private readonly mediaClient: MediaClientService,
    private readonly imagesService: ImagesService,
  ) {}

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
        storage: require('multer').memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          const allowedTypes = /jpeg|jpg|png|gif|webp/;
          const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(file.originalname.toLowerCase());
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
    @Req() req: any,
  ) {
    this.logger.log('POST /map-locations - Raw FormData:', body);
    this.logger.log('Uploaded files:', files);

    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const category = body.category || 'van-hoa';

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

    // === XỬ LÝ NĂM ẢNH ===
    const imageYear = normalizeYearInput(body.imageYear ?? body.ImageYear);
    const oldImageYear = normalizeYearInput(body.oldImageYear ?? body.OldImageYear);

    // === XỬ LÝ ẢNH - UPLOAD TO MEDIA SERVICE ===
    let imageUrl = body.image || null;
    let oldImageUrl = body.oldImage || null;

    // Upload new image if provided
    if (files?.image?.[0]) {
      const uploadResult = await this.mediaClient.uploadToMediaService(
        files.image[0],
        token,
        'post',
        category,
      );
      imageUrl = uploadResult.url;
      
      // Save to DB Images
      await this.imagesService.create(imageUrl, undefined, `Map location: ${title}`, 'map');
    }

    // Upload old image if provided
    if (files?.oldImage?.[0]) {
      const uploadResult = await this.mediaClient.uploadToMediaService(
        files.oldImage[0],
        token,
        'post',
        category,
      );
      oldImageUrl = uploadResult.url;
      
      // Save to DB Images
      await this.imagesService.create(oldImageUrl, undefined, `Map location (old): ${title}`, 'map');
    }

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
      imageYear,
      oldImageYear,
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
        storage: require('multer').memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          const allowedTypes = /jpeg|jpg|png|gif|webp/;
          const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(file.originalname.toLowerCase());
          if (isValid) {
            cb(null, true);
          } else {
            cb(new BadRequestException(`File type không hợp lệ: ${file.originalname}`), false);
          }
        },
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
    @Req() req: any,
  ) {
    this.logger.log(`PUT /map-locations/${id} - Body:`, body);

    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const category = body.category || 'van-hoa';

    // Upload new image if provided
    let imageUrl = body.image || undefined;
    if (files?.image?.[0]) {
      const uploadResult = await this.mediaClient.uploadToMediaService(
        files.image[0],
        token,
        'post',
        category,
      );
      imageUrl = uploadResult.url;
      
      // Save to DB Images
      await this.imagesService.create(imageUrl, undefined, `Map location: ${body.title}`, 'map');
    }

    // Upload old image if provided
    let oldImageUrl = body.oldImage || undefined;
    if (files?.oldImage?.[0]) {
      const uploadResult = await this.mediaClient.uploadToMediaService(
        files.oldImage[0],
        token,
        'post',
        category,
      );
      oldImageUrl = uploadResult.url;
      
      // Save to DB Images
      await this.imagesService.create(oldImageUrl, undefined, `Map location (old): ${body.title}`, 'map');
    }

    let categoryId: number | null = null;
    if (body.CategoryID !== undefined) {
      const parsed = parseInt(body.CategoryID, 10);
      categoryId = !isNaN(parsed) && parsed > 0 ? parsed : null;
    }

    const imageYear = normalizeYearInput(body.imageYear ?? body.ImageYear);
    const oldImageYear = normalizeYearInput(body.oldImageYear ?? body.OldImageYear);

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
      imageYear,
      oldImageYear,
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 5 }],
      {
        storage: require('multer').memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          const allowedTypes = /jpeg|jpg|png|gif|webp/;
          const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(file.originalname.toLowerCase());
          if (isValid) {
            cb(null, true);
          } else {
            cb(new BadRequestException(`File type không hợp lệ: ${file.originalname}`), false);
          }
        },
      },
    ),
  )
  async addFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    feedbackDto: {
      rating: number;
      comment: string;
      userId: number;
    },
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
    @Req() req: any,
  ) {
    if (!feedbackDto.userId || !feedbackDto.rating || !feedbackDto.comment) {
      throw new BadRequestException('userId, rating, comment là bắt buộc');
    }

    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const category = 'feedback';

    // Upload all images to media-service
    const imageUrls: string[] = [];
    if (files?.images && files.images.length > 0) {
      for (const file of files.images) {
        const uploadResult = await this.mediaClient.uploadToMediaService(
          file,
          token,
          'post',
          category,
        );
        imageUrls.push(uploadResult.url);
        
        // Save to DB Images
        await this.imagesService.create(uploadResult.url, undefined, `Feedback for location ${id}`, 'feedback');
      }
    }

    return this.mapLocationsService.addFeedback(id, feedbackDto.userId, {
      rating: feedbackDto.rating,
      comment: feedbackDto.comment,
      imageUrls,
    });
  }

  // POST /map-locations/:locationId/feedback/:feedbackId/like
  @Post(':locationId/feedback/:feedbackId/like')
  async likeFeedback(
    @Param('locationId', ParseIntPipe) locationId: number,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
  ) {
    return this.mapLocationsService.likeFeedback(feedbackId);
  }

  // DELETE /map-locations/:locationId/feedback/:feedbackId/like
  @Delete(':locationId/feedback/:feedbackId/like')
  async unlikeFeedback(
    @Param('locationId', ParseIntPipe) locationId: number,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
  ) {
    return this.mapLocationsService.unlikeFeedback(feedbackId);
  }
}