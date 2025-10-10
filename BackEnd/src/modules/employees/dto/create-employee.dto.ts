import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SystemRole } from 'src/common/enums/role.enum';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString({message:'Phải nhập vào chuỗi'})
  @IsNotEmpty({message:'Không được để trống'})
  fullName: string;

  @ApiProperty()
  @IsNumber({},{ message: 'Phải là số'})
  departmentId: number;

  @ApiProperty({required: false })
  @IsNumber()
  @IsOptional()
  baseSalary?: number;

  @ApiProperty({ description: 'Vai trò: ADMIN, PHONG_TRUONG, PHO_PHONG, TO_TRUONG, NHAN_VIEN',required: false })
  @IsEnum(SystemRole)
  @IsOptional()
  role?: SystemRole;
}
