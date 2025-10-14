import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const MAX_TITLE_LENGTH = 200;
const MAX_LANGUAGE_LENGTH = 10;

/**
 * Create article DTO
 */
export class CreateArticleDto {
  @ApiProperty({ example: 'Historical Event in Hanoi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TITLE_LENGTH)
  readonly title!: string;

  @ApiProperty({ example: 'This is the content of the article...' })
  @IsString()
  @IsNotEmpty()
  readonly content!: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_LANGUAGE_LENGTH)
  readonly language!: string;
}

