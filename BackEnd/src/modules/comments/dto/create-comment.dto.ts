import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 1,
    description: 'ID của bài viết mà bình luận thuộc về',
  })
  @IsNotEmpty()
  @IsNumber()
  articleId: number;

  @ApiProperty({
    example: 2,
    description: 'ID của người dùng đang đăng bình luận (sẽ được lấy tự động từ JWT token)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({
    example: 'Bài viết này thật sự rất thú vị và nhiều thông tin bổ ích!',
    description: 'Nội dung bình luận của người dùng',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: 5,
    required: false,
    nullable: true,
    description: 'ID của bình luận cha (nếu đây là phản hồi, nếu không thì bỏ trống)',
  })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    required: false,
    description: 'Tên người được trả lời',
  })
  @IsOptional()
  @IsString()
  replyToName?: string;

  @ApiProperty({
    example: 'example@gmail.com',
    required: false,
    description: 'Email của người bình luận (nếu muốn hiển thị riêng)',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    required: false,
    description: 'Tên hiển thị của người bình luận (nếu cần hiển thị khác User.FullName)',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    example: '/uploads/avatar.png',
    required: false,
    description: 'Đường dẫn ảnh đại diện của người bình luận',
  })
  @IsOptional()
  @IsString()
  avatarPath?: string;

  @ApiProperty({
    example: { label: 'hate', action: 'allow' },
    required: false,
    description: 'Optional moderation metadata from AI (stored as JSON)'
  })
  @IsOptional()
  @IsObject()
  moderation?: any;
}