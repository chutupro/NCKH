import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 1,
    description: 'ID của bài viết mà bình luận thuộc về',
  })
  articleId: number;

  @ApiProperty({
    example: 2,
    description: 'ID của người dùng đang đăng bình luận (UserID phải tồn tại trong DB)',
  })
  userId: number;

  @ApiProperty({
    example: 'Bài viết này thật sự rất thú vị và nhiều thông tin bổ ích!',
    description: 'Nội dung bình luận của người dùng',
  })
  content: string;

  @ApiProperty({
    example: 5,
    required: false,
    nullable: true,
    description: 'ID của bình luận cha (nếu đây là phản hồi, nếu không thì bỏ trống)',
  })
  parentCommentId?: number;

  @ApiProperty({
    example: 'example@gmail.com',
    required: false,
    description: 'Email của người bình luận (nếu muốn hiển thị riêng)',
  })
  email?: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    required: false,
    description: 'Tên hiển thị của người bình luận (nếu cần hiển thị khác User.FullName)',
  })
  displayName?: string;

  @ApiProperty({
    example: '/uploads/avatar.png',
    required: false,
    description: 'Đường dẫn ảnh đại diện của người bình luận',
  })
  avatarPath?: string;
}
