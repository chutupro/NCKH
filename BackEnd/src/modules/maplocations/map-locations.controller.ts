import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFiles, BadRequestException, Logger } from '@nestjs/common';
import { MapLocationsService } from './map-locations.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

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
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'oldImage', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    })
  )
  async create(
    @Body() createLocationDto: any,
    @UploadedFiles() files: { image?: Express.Multer.File[]; oldImage?: Express.Multer.File[] },
  ) {
    this.logger.log('Received create request with body:', createLocationDto);
    if (!createLocationDto.latitude || !createLocationDto.longitude || !createLocationDto.title || !createLocationDto.address) {
      throw new BadRequestException('Title, address, latitude, and longitude are required');
    }

    let imageUrl = createLocationDto.image || '';
    if (files.image && files.image.length > 0) {
      this.logger.log('Image file uploaded successfully:', files.image[0]);
      imageUrl = `/uploads/${files.image[0].filename}`;
    } else {
      this.logger.warn('No image file uploaded, using existing image URL:', imageUrl);
    }

    let oldImageUrl = createLocationDto.oldImage || '';
    if (files.oldImage && files.oldImage.length > 0) {
      this.logger.log('Old image file uploaded successfully:', files.oldImage[0]);
      oldImageUrl = `/uploads/${files.oldImage[0].filename}`;
    } else {
      this.logger.warn('No old image file uploaded, using existing old image URL:', oldImageUrl);
    }

    const createLocationDtoWithImage = {
      ...createLocationDto,
      title: createLocationDto.title,
      image: imageUrl,
      oldImage: oldImageUrl,
    };

    try {
      const result = await this.mapLocationsService.create(createLocationDtoWithImage);
      this.logger.log('Location created successfully:', result);
      return { ...result, image: imageUrl, oldImage: oldImageUrl };
    } catch (error) {
      this.logger.error('Error creating location:', error);
      throw new BadRequestException(`Failed to create location: ${error.message}`);
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLocationDto: any) {
    return this.mapLocationsService.update(+id, updateLocationDto);
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
  addFeedback(@Param('id') id: string, @Body() feedbackDto: { rating: number; comment: string; userId: number }) {
    return this.mapLocationsService.addFeedback(+id, feedbackDto.userId, feedbackDto);
  }
}