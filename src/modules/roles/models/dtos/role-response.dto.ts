import { ApiProperty } from '@nestjs/swagger';

/**
 * Role response DTO
 */
export class RoleResponseDto {
  @ApiProperty()
  readonly roleId!: number;

  @ApiProperty()
  readonly roleName!: string;

  @ApiProperty()
  readonly description!: string | null;
}

