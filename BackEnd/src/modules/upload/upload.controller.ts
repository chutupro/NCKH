import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaClientService } from 'src/common/media-client.service';
import { ImagesService } from 'src/common/images.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly mediaClient: MediaClientService,
    private readonly imagesService: ImagesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: require('multer').memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const type = body.type || 'post';
    
    // Map CategoryID to folder name
    const categoryMap = {
      1: 'di-san',
      2: 'van-hoa',
      3: 'thien-nhien',
      4: 'su-kien',
    };
    
    const categoryId = body.categoryId ? parseInt(body.categoryId) : null;
    const category = categoryId ? categoryMap[categoryId] : (body.category || 'van-hoa');
    
    console.log(`[Upload] CategoryID: ${categoryId} → Folder: ${category}`);

    // 1. Upload to media-service
    const uploadResult = await this.mediaClient.uploadToMediaService(
      file,
      token,
      type,
      category,
    );

    // 2. Save to DB Images với CategoryID và CollectionID
    // KHÔNG DÙNG file.originalname (bị lỗi encoding UTF-8)
    const collectionId = body.collectionId ? parseInt(body.collectionId) : null;
    
    const imageRecord = await this.imagesService.create(
      uploadResult.url,
      undefined,
      body.altText || body.title || null,  // Lưu tiêu đề vào AltText
      type,
      categoryId,  // Truyền CategoryID
      collectionId, // Truyền CollectionID
    );

    return {
      message: 'Upload successful',
      filePath: uploadResult.url,
      imageId: imageRecord.ImageID,
    };
  }
}
