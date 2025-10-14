import { ApiProperty } from '@nestjs/swagger';

/**
 * Contribution response DTO
 */
export class ContributionResponseDto {
  @ApiProperty()
  readonly contributionId!: number;

  @ApiProperty()
  readonly articleId!: number;

  @ApiProperty()
  readonly userId!: number;

  @ApiProperty()
  readonly content!: string;

  @ApiProperty()
  readonly status!: string;

  @ApiProperty()
  readonly submittedAt!: Date;

  @ApiProperty()
  readonly authorName!: string;
}

