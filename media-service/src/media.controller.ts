import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  Body,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload ảnh/video vào kho storage
   * 
   * @endpoint POST /upload
   * @headers Authorization: Bearer <access_token>
   * @body file (multipart/form-data) - File ảnh/video
   * @body type (string) - "avatar" hoặc "post"
   * @body category (string) - "van-hoa" | "du-lich" | "thien-nhien" | "kien-truc" (bắt buộc nếu type=post)
   * 
   * @returns { url, type, category, filename, size }
   * 
   * @example
   * POST http://localhost:3001/upload
   * Authorization: Bearer eyJhbGciOiJ...
   * Content-Type: multipart/form-data
   * 
   * file: my-image.jpg
   * type: post
   * category: van-hoa
   */
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', {
    limits: { 
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
      // Chỉ cho phép ảnh và video
      const allowedExtensions = /\.(jpg|jpeg|png|mp4|mov)$/i;
      const isValid = allowedExtensions.test(file.originalname);
      
      if (!isValid) {
        return cb(
          new BadRequestException('Chỉ cho phép file: .jpg, .jpeg, .png, .mp4, .mov'),
          false
        );
      }
      
      cb(null, true);
    },
  }))
  async upload(
    @UploadedFile() file: any, // Express.Multer.File
    @Body('type') type: string,
    @Body('category') category: string,
    @Headers('authorization') authHeader: string,
  ) {
    // 1. Validation: File
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    // 2. Validation: Type
    if (!type) {
      throw new BadRequestException('Type không được để trống (avatar hoặc post)');
    }

    // 3. Validation: Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Thiếu Authorization header (Bearer token)');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Token không hợp lệ');
    }

    // 4. Validation: Category (bắt buộc nếu type = post)
    if (type === 'post' && !category) {
      throw new BadRequestException('Category bắt buộc khi type = post');
    }

    // 5. Delegate to service
    return this.mediaService.upload(
      file, 
      token, 
      type as 'avatar' | 'post', 
      category
    );
  }

  /**
   * Health check endpoint
   */
  @Post('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'OK',
      service: 'Media Service',
      timestamp: new Date().toISOString(),
    };
  }
}
