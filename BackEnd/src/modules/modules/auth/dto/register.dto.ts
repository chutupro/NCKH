import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'Mật khẩu quá yếu.',
  })
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, { message: 'Họ và tên không được chứa ký tự đặc biệt.' })
  fullName?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
