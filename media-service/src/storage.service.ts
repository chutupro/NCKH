import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  // Base path: media-service/storage/
  private readonly basePath = path.join(__dirname, '..', 'storage');

  constructor() {
    // Đảm bảo storage folder tồn tại
    this.ensureStorageExists();
  }

  /**
   * Lưu file vào storage
   * 
   * @param buffer - File buffer từ multer
   * @param filePath - Relative path: "avatar/user-123/avatar_123.jpg"
   * 
   * Tự động tạo folder nếu chưa tồn tại
   */
  async save(buffer: Buffer, filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const directory = path.dirname(fullPath);

      // Tạo folder đệ quy (mkdir -p)
      await fs.promises.mkdir(directory, { recursive: true });

      // Ghi file
      await fs.promises.writeFile(fullPath, buffer);
      
      console.log(`[Storage] ✅ Saved: ${filePath}`);
    } catch (error) {
      console.error(`[Storage] ❌ Error saving file:`, error);
      throw new InternalServerErrorException('Không thể lưu file vào storage');
    }
  }

  /**
   * Xóa file (dùng cho cleanup sau này nếu cần)
   */
  async delete(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      await fs.promises.unlink(fullPath);
      
      console.log(`[Storage] 🗑️ Deleted: ${filePath}`);
    } catch (error) {
      // File không tồn tại → ignore
      if (error.code !== 'ENOENT') {
        console.error(`[Storage] ❌ Error deleting file:`, error);
        throw new InternalServerErrorException('Không thể xóa file');
      }
    }
  }

  /**
   * Kiểm tra file có tồn tại không
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Đảm bảo storage folder tồn tại khi khởi động service
   */
  private ensureStorageExists(): void {
    const folders = ['avatar', 'van-hoa', 'du-lich', 'thien-nhien', 'kien-truc'];
    
    folders.forEach(folder => {
      const folderPath = path.join(this.basePath, folder);
      
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`[Storage] 📁 Created folder: ${folder}`);
      }
    });
  }
}
