// ...existing code...
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
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GalleryService } from './gallery.service';
import * as fs from 'fs';
import * as path from 'path';

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
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.galleryService.findAll(skip ?? 0, take ?? 20);
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
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.galleryService.create(file, {
      title: body.title,
      description: body.description,
      tags: body.tags,
      categoryId: body.categoryId,
    });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.galleryService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.galleryService.remove(id);
  }
}
// ...existing code...