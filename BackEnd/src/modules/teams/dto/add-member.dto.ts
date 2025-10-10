import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddMemberDto {// TO_TRUONG
  @ApiProperty()
  @IsNumber()
  employeeId: number;
}
