import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SystemRole } from 'src/common/enums/role.enum';

export class updateEmployee {
  @ApiProperty({required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @ApiProperty({required: false })
  @IsNumber()
  @IsOptional()
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
