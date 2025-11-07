import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';

@Injectable()
export class MediaService {
  private readonly VALID_TYPES = ['avatar', 'post'];
  private readonly VALID_CATEGORIES = ['van-hoa', 'du-lich', 'thien-nhien', 'kien-truc'];
  private readonly MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || 'http://localhost:3001';

  constructor(private readonly storage: StorageService) {}

  /**
   * Upload file vào storage
   * 
   * Flow:
   * 1. Decode token → lấy userId từ sub (không verify - tin tưởng web chính)
   * 2. Validate type + category
   * 3. Xác định folder:
   *    - avatar → storage/avatar/userId/
   *    - post   → storage/[category]/userId/
   * 4. Tạo filename: tên-gốc_timestamp.ext
   * 5. Lưu file vào disk
   * 6. Trả URL public
   */
  async upload(
    file: any, // Express.Multer.File
    token: string,
    type: 'avatar' | 'post',
    category?: string,
  ) {
    // 1. Lấy userId từ token (CHỈ DECODE, KHÔNG VERIFY)
    // Tin tưởng rằng web chính đã verify token trước khi gọi API này
    let userId: string;
    try {
      const payload = jwt.decode(token) as any;
      userId = payload?.sub;
      
      if (!userId) {
        throw new Error('Missing sub claim in token');
      }
      
      console.log(`[Media Service] Upload request from userId: ${userId}`);
    } catch (error) {
      throw new BadRequestException('Token không hợp lệ hoặc thiếu sub claim');
    }

    // 2. Validate type
    if (!this.VALID_TYPES.includes(type)) {
      throw new BadRequestException(
        `Type không hợp lệ. Phải là: ${this.VALID_TYPES.join(', ')}`
      );
    }

    // 3. Validate category (bắt buộc nếu type = post)
    if (type === 'post') {
      if (!category) {
        throw new BadRequestException('Category bắt buộc khi type = post');
      }
      
      if (!this.VALID_CATEGORIES.includes(category)) {
        throw new BadRequestException(
          `Category không hợp lệ. Phải là: ${this.VALID_CATEGORIES.join(', ')}`
        );
      }
    }

    // 4. Xác định folder
    // avatar → storage/avatar/userId/
    // post   → storage/[category]/userId/
    const folder = type === 'avatar' ? 'avatar' : category;

    // 5. Tạo filename an toàn
    const originalName = file.originalname;
    const ext = path.extname(originalName); // .jpg
    const baseName = path.basename(originalName, ext); // my-image
    const timestamp = Date.now();
    
    // Sanitize basename: loại bỏ ký tự đặc biệt
    const safeBaseName = this.sanitizeFilename(baseName);
    const filename = `${safeBaseName}_${timestamp}${ext}`;

    // 6. Path đầy đủ: folder/userId/filename
    // Ví dụ: van-hoa/user-123/hoi-an_1730901234.jpg
    const filePath = `${folder}/${userId}/${filename}`;

    // 7. Lưu file vào storage
    await this.storage.save(file.buffer, filePath);

    console.log(`[Media Service] ✅ File saved: ${filePath}`);

    // 8. Trả về URL public
    const publicUrl = `${this.MEDIA_SERVICE_URL}/storage/${filePath}`;
    
    return {
      url: publicUrl,
      type,
      category: type === 'post' ? category : null,
      filename,
      size: file.size,
      path: filePath, // Relative path (để xóa sau này nếu cần)
    };
  }

  /**
   * Sanitize filename - loại bỏ ký tự đặc biệt, chỉ giữ chữ cái, số, dấu gạch ngang
   * 
   * @example
   * "Ảnh Hội An.jpg" → "anh-hoi-an"
   * "my photo (1).jpg" → "my-photo-1"
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .normalize('NFD') // Tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .replace(/đ/g, 'd') // đ → d
      .replace(/[^a-z0-9.-]/g, '-') // Thay ký tự đặc biệt bằng -
      .replace(/-+/g, '-') // Gộp nhiều - thành 1
      .replace(/^-|-$/g, ''); // Xóa - đầu/cuối
  }
}
