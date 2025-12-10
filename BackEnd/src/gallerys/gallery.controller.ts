import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  Body,
  ParseIntPipe,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { MediaClientService } from 'src/common/media-client.service';
import { ImagesService } from 'src/common/images.service';

@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly mediaClient: MediaClientService,
    private readonly imagesService: ImagesService,
  ) {}

  // 👉 Trả về tất cả hình ảnh, không cần query params
  @Get()
  async list() {
    return this.galleryService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
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
    }),
  )
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateGalleryDto,
    @Req() req: any,
  ) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const category = body.categoryId || 'gallery';

    // Upload to media-service
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
      body.title || 'Gallery image',
      'gallery',
    );

    return this.galleryService.create(file, body, uploadResult.url);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateGalleryDto,
  ) {
    return this.galleryService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.galleryService.remove(id);
  }
}
