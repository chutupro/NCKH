import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Cập nhật nội dung bình luận mới...',
    description: 'Nội dung mới của bình luận',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
