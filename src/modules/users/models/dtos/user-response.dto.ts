import { ApiProperty } from '@nestjs/swagger';

/**
 * User response DTO
 */
export class UserResponseDto {
  @ApiProperty()
  readonly userId!: number;

  @ApiProperty()
  readonly email!: string;

  @ApiProperty()
  readonly fullName!: string;

  @ApiProperty()
  readonly roleName!: string;

  @ApiProperty()
  readonly createdAt!: Date;
}

