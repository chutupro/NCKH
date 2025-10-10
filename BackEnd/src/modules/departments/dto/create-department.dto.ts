import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  companyId: number;
}
