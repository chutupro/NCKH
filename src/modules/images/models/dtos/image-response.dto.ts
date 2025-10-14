import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Image response DTO
 */
export class ImageResponseDto {
  @ApiProperty()
  readonly imageId!: number;

  @ApiProperty()
  readonly articleId!: number;

  @ApiProperty()
  readonly filePath!: string;

  @ApiPropertyOptional()
  readonly altText!: string | null;

  @ApiProperty()
  readonly type!: string;

  @ApiPropertyOptional()
  readonly captureDate!: Date | null;

  @ApiPropertyOptional()
  readonly location!: string | null;
}

