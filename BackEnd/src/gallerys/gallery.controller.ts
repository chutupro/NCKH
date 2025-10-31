import {
  Controller,
  Get,
  Query,
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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GalleryService } from './gallery.service';
import * as fs from 'fs';
import * as path from 'path';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

function ensureUploadsDir() {
  const dir = path.join(process.cwd(), 'uploads', 'gallery');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async list(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.galleryService.findAll({
      skip: Number(skip) || 0,
      take: Number(take) || 20,
      q,
      categoryId: categoryId ? Number(categoryId) : undefined,
    });
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: () => ensureUploadsDir(),
        filename: (_req, file, cb) => {
          const timestamp = Date.now();
          const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          cb(null, `${timestamp}_${safe}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateGalleryDto,
  ) {
    return this.galleryService.create(file, body);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateGalleryDto) {
    return this.galleryService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.galleryService.remove(id);
  }
}