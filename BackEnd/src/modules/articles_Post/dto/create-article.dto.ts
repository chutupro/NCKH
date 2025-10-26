import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'Tiêu đề bài viết' })
  title: string;

  @ApiProperty({ example: 'Nội dung bài viết', required: false })
  content?: string;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 1 }) // userId tồn tại trong DB
  userId: number;

  @ApiProperty({ example: 'example@gmail.com', required: false })
  email?: string;

  @ApiProperty({ example: '/uploads/image.jpg', required: false })
  imagePath?: string;

  @ApiProperty({ example: 'Mô tả ảnh', required: false })
  imageDescription?: string;
}
