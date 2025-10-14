import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Location response DTO
 */
export class LocationResponseDto {
  @ApiProperty()
  readonly locationId!: number;

  @ApiProperty()
  readonly name!: string;

  @ApiProperty()
  readonly latitude!: number;

  @ApiProperty()
  readonly longitude!: number;

  @ApiPropertyOptional()
  readonly description!: string | null;

  @ApiPropertyOptional()
  readonly timelineId!: number | null;

  @ApiPropertyOptional()
  readonly articleId!: number | null;
}

