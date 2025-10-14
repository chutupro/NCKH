import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ImagesService } from '../services/images.service';
import { UploadImageDto } from '../models/dtos/upload-image.dto';
import { UploadImageSwaggerDto } from '../models/dtos/upload-image-swagger.dto';
import { UpdateImageDto } from '../models/dtos/update-image.dto';
import { Public } from '../../../core/decorators/public.decorator';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Images controller
 */
@ApiTags('Images')
@ApiBearerAuth()
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  /**
   * Upload image
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload image' })
  @ApiBody({ type: UploadImageSwaggerDto })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    return this.imagesService.uploadImage({ file, uploadImageDto });
  }

  /**
   * Get image by ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get image by ID' })
  @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
  async getImageById(@Param('id', ParseIntPipe) imageId: number) {
    return this.imagesService.getImageById({ imageId });
  }

  /**
   * Get images by article
   */
  @Public()
  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get images by article ID' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  async getImagesByArticleId(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.imagesService.getImagesByArticleId({ articleId });
  }

  /**
   * Update image
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update image metadata' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  async updateImage(
    @Param('id', ParseIntPipe) imageId: number,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imagesService.updateImage({ imageId, updateImageDto });
  }

  /**
   * Delete image
   */
  @Delete(':id')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Delete image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteImage(@Param('id', ParseIntPipe) imageId: number) {
    await this.imagesService.deleteImage({ imageId });
    return { message: 'Image deleted successfully' };
  }

  /**
   * Smoke test endpoint for admin
   */
  @Get('admin/test')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Admin smoke test' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return { message: 'Images admin test successful' };
  }
}

