import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import FormData = require('form-data');

/**
 * Service gọi Media Service API để upload ảnh
 * Flow: Backend nhận file → Forward to Media Service → Nhận URL → Lưu vào DB Images
 */
@Injectable()
export class MediaClientService {
  private readonly MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || 'http://localhost:3001';

  /**
   * Upload file qua Media Service
   */
  async uploadToMediaService(
    file: Express.Multer.File,
    token: string,
    type: 'avatar' | 'post',
    category?: string,
  ): Promise<{ url: string; type: string; category?: string; userId: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('type', type);
      
      if (category) {
        formData.append('category', category);
      }

      console.log(`[MediaClient] Uploading to ${this.MEDIA_SERVICE_URL}/upload`);

      const response = await axios.post(`${this.MEDIA_SERVICE_URL}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      console.log(`[MediaClient] ✅ Upload successful:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[MediaClient] ❌ Upload failed:', error.response?.data || error.message);
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to upload to media service'
      );
    }
  }
}
