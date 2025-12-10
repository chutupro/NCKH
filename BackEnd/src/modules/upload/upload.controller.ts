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
    const category = body.category || 'van-hoa';

    // 1. Upload to media-service
    const uploadResult = await this.mediaClient.uploadToMediaService(
      file,
      token,
      type,
      category,
    );

    // 2. Save to DB Images
    const imageRecord = await this.imagesService.create(
      uploadResult.url,
      undefined,
      body.altText || file.originalname,
      type,
    );

    return {
      message: 'Upload successful',
      filePath: uploadResult.url,
      imageId: imageRecord.ImageID,
    };
  }
}
