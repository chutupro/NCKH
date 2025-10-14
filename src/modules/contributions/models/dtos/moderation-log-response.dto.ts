import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Moderation log response DTO
 */
export class ModerationLogResponseDto {
  @ApiProperty()
  readonly logId!: number;

  @ApiProperty()
  readonly contributionId!: number;

  @ApiProperty()
  readonly moderatorId!: number;

  @ApiProperty()
  readonly action!: string;

  @ApiPropertyOptional()
  readonly reason!: string | null;

  @ApiProperty()
  readonly timestamp!: Date;

  @ApiProperty()
  readonly moderatorName!: string;
}

