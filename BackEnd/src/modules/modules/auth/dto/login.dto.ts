import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
  password: string;

  // 🔐 GHI NHỚ ĐĂNG NHẬP (giống Facebook/Shopee)
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
