import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Feedback response DTO
 */
export class FeedbackResponseDto {
  @ApiProperty()
  readonly feedbackId!: number;

  @ApiProperty()
  readonly articleId!: number;

  @ApiProperty()
  readonly userId!: number;

  @ApiPropertyOptional()
  readonly comment!: string | null;

  @ApiPropertyOptional()
  readonly rating!: number | null;

  @ApiProperty()
  readonly createdAt!: Date;

  @ApiProperty()
  readonly authorName!: string;
}

