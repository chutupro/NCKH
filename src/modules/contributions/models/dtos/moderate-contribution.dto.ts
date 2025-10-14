import { IsNotEmpty, IsString, IsOptional, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MAX_REASON_LENGTH = 500;

/**
 * Moderate contribution DTO
 */
export class ModerateContributionDto {
  @ApiProperty({ example: 'Approved', enum: ['Approved', 'Rejected'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Approved', 'Rejected'])
  readonly action!: string;

  @ApiPropertyOptional({ example: 'Content meets quality standards' })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_REASON_LENGTH)
  readonly reason?: string;
}

