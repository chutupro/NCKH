import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { RegisterDto } from './models/dtos/register.dto';
import { AuthResponse } from './models/types/auth-response.type';
import { JwtPayload } from './models/types/jwt-payload.type';
import { ROLES } from '../../shared/constants/roles.constant';

const BCRYPT_ROUNDS = 10;

/**
 * Authentication service
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.findUserByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = await this.hashPassword(registerDto.password);
    const defaultRole = await this.findRoleByName(ROLES.USER);
    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      roleId: defaultRole.roleId,
    });
    const savedUser = await this.userRepository.save(user);
    const userWithRole = await this.userRepository.findOne({
      where: { userId: savedUser.userId },
      relations: ['role'],
    });
    return this.generateAuthResponse(userWithRole!);
  }

  /**
   * Validates user credentials
   */
  async validateUser({ email, password }: { email: string; password: string }) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user) {
      return null;
    }
    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }
    return {
      userId: user.userId,
      email: user.email,
      role: user.role.roleName,
    };
  }

  /**
   * Generates authentication tokens
   */
  async login(user: { userId: number; email: string; role: string }): Promise<AuthResponse> {
    const fullUser = await this.userRepository.findOne({
      where: { userId: user.userId },
      relations: ['role'],
    });
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    return this.generateAuthResponse(fullUser);
  }

  /**
   * Generates authentication response with tokens
   */
  private generateAuthResponse(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role.roleName,
    };
    const accessToken = this.jwtService.sign(payload as any);
    const refreshToken = this.jwtService.sign(payload as any, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-jwt-refresh-secret-dev-only',
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
    });
    return {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role.roleName,
      },
    };
  }

  /**
   * Hashes password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Compares password with hash
   */
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Finds user by email
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Finds role by name
   */
  private async findRoleByName(roleName: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { roleName } });
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }
    return role;
  }
}

