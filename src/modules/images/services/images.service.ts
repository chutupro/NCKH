import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { UploadImageDto } from '../models/dtos/upload-image.dto';
import { UpdateImageDto } from '../models/dtos/update-image.dto';
import { ImageResponseDto } from '../models/dtos/image-response.dto';
import { FileUploadService } from '../../../shared/services/file-upload.service';

/**
 * Images service
 */
@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Uploads and saves image
   */
  async uploadImage({
    file,
    uploadImageDto,
  }: {
    file: Express.Multer.File;
    uploadImageDto: UploadImageDto;
  }): Promise<ImageResponseDto> {
    const uploadResult = await this.fileUploadService.saveFile(file);
    const image = this.imageRepository.create({
      articleId: uploadImageDto.articleId,
      filePath: uploadResult.filePath,
      altText: uploadImageDto.altText || null,
      type: uploadImageDto.type,
      captureDate: uploadImageDto.captureDate ? new Date(uploadImageDto.captureDate) : null,
      location: uploadImageDto.location || null,
    });
    const savedImage = await this.imageRepository.save(image);
    return this.mapToResponseDto(savedImage);
  }

  /**
   * Gets image by ID
   */
  async getImageById({ imageId }: { imageId: number }): Promise<ImageResponseDto> {
    const image = await this.imageRepository.findOne({ where: { imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return this.mapToResponseDto(image);
  }

  /**
   * Gets all images for article
   */
  async getImagesByArticleId({ articleId }: { articleId: number }): Promise<ImageResponseDto[]> {
    const images = await this.imageRepository.find({ where: { articleId } });
    return images.map((image) => this.mapToResponseDto(image));
  }

  /**
   * Updates image metadata
   */
  async updateImage({
    imageId,
    updateImageDto,
  }: {
    imageId: number;
    updateImageDto: UpdateImageDto;
  }): Promise<ImageResponseDto> {
    const image = await this.imageRepository.findOne({ where: { imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    if (updateImageDto.altText !== undefined) {
      image.altText = updateImageDto.altText;
    }
    if (updateImageDto.type) {
      image.type = updateImageDto.type;
    }
    if (updateImageDto.captureDate) {
      image.captureDate = new Date(updateImageDto.captureDate);
    }
    if (updateImageDto.location !== undefined) {
      image.location = updateImageDto.location;
    }
    await this.imageRepository.save(image);
    return this.mapToResponseDto(image);
  }

  /**
   * Deletes image
   */
  async deleteImage({ imageId }: { imageId: number }): Promise<void> {
    const image = await this.imageRepository.findOne({ where: { imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    await this.fileUploadService.deleteFile(image.filePath);
    await this.imageRepository.delete(imageId);
  }

  /**
   * Maps image entity to response DTO
   */
  private mapToResponseDto(image: Image): ImageResponseDto {
    return {
      imageId: image.imageId,
      articleId: image.articleId,
      filePath: image.filePath,
      altText: image.altText,
      type: image.type,
      captureDate: image.captureDate,
      location: image.location,
    };
  }
}

