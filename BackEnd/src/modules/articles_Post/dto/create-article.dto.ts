import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty({ example: 'Tiêu đề bài viết' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Nội dung bài viết', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: 1 }) // userId tồn tại trong DB
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'example@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '/uploads/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imagePath?: string;

  @ApiProperty({ example: 'Mô tả ảnh', required: false })
  @IsOptional()
  @IsString()
  imageDescription?: string;
}