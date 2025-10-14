import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../models/dtos/create-user.dto';
import { UpdateUserDto } from '../models/dtos/update-user.dto';
import { UserResponseDto } from '../models/dtos/user-response.dto';

const BCRYPT_ROUNDS = 10;

/**
 * Users service
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Creates new user
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = await this.hashPassword(createUserDto.password);
    const user = this.userRepository.create({
      email: createUserDto.email,
      passwordHash,
      fullName: createUserDto.fullName,
      roleId: createUserDto.roleId,
    });
    const savedUser = await this.userRepository.save(user);
    return this.getUserById({ userId: savedUser.userId });
  }

  /**
   * Gets user by ID
   */
  async getUserById({ userId }: { userId: number }): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapToResponseDto(user);
  }

  /**
   * Gets all users
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({ relations: ['role'] });
    return users.map((user) => this.mapToResponseDto(user));
  }

  /**
   * Updates user
   */
  async updateUser({ userId, updateUserDto }: { userId: number; updateUserDto: UpdateUserDto }): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findUserByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      user.email = updateUserDto.email;
    }
    if (updateUserDto.password) {
      user.passwordHash = await this.hashPassword(updateUserDto.password);
    }
    if (updateUserDto.fullName) {
      user.fullName = updateUserDto.fullName;
    }
    if (updateUserDto.roleId) {
      user.roleId = updateUserDto.roleId;
    }
    await this.userRepository.save(user);
    return this.getUserById({ userId });
  }

  /**
   * Deletes user
   */
  async deleteUser({ userId }: { userId: number }): Promise<void> {
    const result = await this.userRepository.delete(userId);
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Finds user by email
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Hashes password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Maps user entity to response DTO
   */
  private mapToResponseDto(user: User): UserResponseDto {
    return {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      roleName: user.role.roleName,
      createdAt: user.createdAt,
    };
  }
}

