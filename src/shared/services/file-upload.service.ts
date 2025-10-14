import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { FileUploadResult } from '../types/common.types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ONE_MB = 1048576;

/**
 * Handles file upload operations
 */
@Injectable()
export class FileUploadService {
  private readonly uploadPath: string;
  private readonly maxFileSize: number;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', ONE_MB * 10);
    this.ensureUploadDirectoryExists();
  }

  /**
   * Validates if file is an allowed image type
   */
  validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed');
    }
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size`);
    }
  }

  /**
   * Saves uploaded file to disk
   */
  async saveFile(file: Express.Multer.File): Promise<FileUploadResult> {
    this.validateImageFile(file);
    const fileName = this.generateFileName(file.originalname);
    const filePath = path.join(this.uploadPath, fileName);
    await fs.promises.writeFile(filePath, file.buffer);
    return {
      filePath: `/uploads/${fileName}`,
      originalName: file.originalname,
      size: file.size,
    };
  }

  /**
   * Deletes file from disk
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  /**
   * Generates unique file name
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    return `${timestamp}-${random}${extension}`;
  }

  /**
   * Ensures upload directory exists
   */
  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }
}

