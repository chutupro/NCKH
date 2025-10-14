import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MAX_ALTTEXT_LENGTH = 200;
const MAX_TYPE_LENGTH = 20;
const MAX_LOCATION_LENGTH = 100;

/**
 * Upload image DTO for Swagger documentation
 */
export class UploadImageSwaggerDto {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'Image file to upload'
  })
  file!: Express.Multer.File;

  @ApiProperty({ 
    example: 1,
    description: 'Article ID to associate the image with'
  })
  articleId!: number;

  @ApiPropertyOptional({ 
    example: 'Historical photo of Hanoi',
    maxLength: MAX_ALTTEXT_LENGTH,
    description: 'Alternative text for the image'
  })
  altText?: string;

  @ApiProperty({ 
    example: 'historical',
    maxLength: MAX_TYPE_LENGTH,
    description: 'Image type: historical or modern'
  })
  type!: string;

  @ApiPropertyOptional({ 
    example: '2023-01-01',
    description: 'Date when the photo was captured (YYYY-MM-DD)'
  })
  captureDate?: string;

  @ApiPropertyOptional({ 
    example: 'Hanoi, Vietnam',
    maxLength: MAX_LOCATION_LENGTH,
    description: 'Location where the photo was taken'
  })
  location?: string;
}
