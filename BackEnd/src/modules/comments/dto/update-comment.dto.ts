import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Cập nhật nội dung bình luận mới...',
    description: 'Nội dung mới của bình luận',
  })
  content: string;
}
