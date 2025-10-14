import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Timeline response DTO
 */
export class TimelineResponseDto {
  @ApiProperty()
  readonly timelineId!: number;

  @ApiProperty()
  readonly articleId!: number;

  @ApiProperty()
  readonly eventDate!: Date;

  @ApiProperty()
  readonly description!: string;

  @ApiPropertyOptional()
  readonly latitude!: number | null;

  @ApiPropertyOptional()
  readonly longitude!: number | null;
}

