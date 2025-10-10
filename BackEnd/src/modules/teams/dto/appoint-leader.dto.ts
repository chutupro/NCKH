import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AppointLeaderDto {
  @ApiProperty()
  @IsNumber()//PHO_PHONG
  employeeId: number;
}
