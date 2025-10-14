import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const MAX_ANNOTATION_LENGTH = 1000;

/**
 * Create annotation DTO
 */
export class CreateAnnotationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly imageId!: number;

  @ApiProperty({ example: 'This building was constructed in 1920' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ANNOTATION_LENGTH)
  readonly annotationText!: string;
}

