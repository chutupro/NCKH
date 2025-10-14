import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Create contribution DTO
 */
export class CreateContributionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly articleId!: number;

  @ApiProperty({ example: 'This is my contribution to the article...' })
  @IsString()
  @IsNotEmpty()
  readonly content!: string;
}

