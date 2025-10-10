import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, fullName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get default role (user role)
    const defaultRole = await this.roleRepository.findOne({
      where: { RoleName: 'user' },
    });

    if (!defaultRole) {
      throw new Error('Default user role not found');
    }

    // Create new user
    const user = this.userRepository.create({
      Email: email,
      PasswordHash: hashedPassword,
      FullName: fullName,
      RoleID: defaultRole.RoleID,
      CreatedAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = { 
      userId: savedUser.UserID, 
      email: savedUser.Email,
      roleId: savedUser.RoleID 
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        UserID: savedUser.UserID,
        Email: savedUser.Email,
        FullName: savedUser.FullName,
        RoleID: savedUser.RoleID,
        CreatedAt: savedUser.CreatedAt,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      userId: user.UserID, 
      email: user.Email,
      roleId: user.RoleID 
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        UserID: user.UserID,
        Email: user.Email,
        FullName: user.FullName,
        RoleID: user.RoleID,
        CreatedAt: user.CreatedAt,
      },
    };
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { UserID: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      UserID: user.UserID,
      Email: user.Email,
      FullName: user.FullName,
      RoleID: user.RoleID,
      Role: user.role,
      CreatedAt: user.CreatedAt,
    };
  }

  async refreshToken(user: any): Promise<{ access_token: string }> {
    const payload = { 
      userId: user.userId, 
      email: user.email,
      roleId: user.roleId 
    };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  async logout(user: any): Promise<{ message: string }> {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.PasswordHash)) {
      const { PasswordHash, ...result } = user;
      return result;
    }
    return null;
  }
}
