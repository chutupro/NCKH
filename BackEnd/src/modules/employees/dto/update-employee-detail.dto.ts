import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDetailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  CCCD: string;

  @ApiProperty({required: false })
  @IsString()
  @IsOptional()
  phone?: string;


  @ApiProperty({required: false })
  @IsString()
  @IsOptional()
  address?: string;

}
