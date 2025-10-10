import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      relations: ['role'],
    });

    return users.map(user => ({
      UserID: user.UserID,
      Email: user.Email,
      FullName: user.FullName,
      RoleID: user.RoleID,
      Role: user.role,
      CreatedAt: user.CreatedAt,
    }));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { UserID: id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, fullName, roleId } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { Email: email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate role exists
    const role = await this.roleRepository.findOne({
      where: { RoleID: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = this.userRepository.create({
      Email: email,
      PasswordHash: hashedPassword,
      FullName: fullName,
      RoleID: roleId,
      CreatedAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    return {
      UserID: savedUser.UserID,
      Email: savedUser.Email,
      FullName: savedUser.FullName,
      RoleID: savedUser.RoleID,
      Role: role,
      CreatedAt: savedUser.CreatedAt,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { UserID: id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.Email) {
      const existingUser = await this.userRepository.findOne({
        where: { Email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash new password if provided
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Update user
    Object.assign(user, {
      ...updateUserDto,
      UpdatedAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    return {
      UserID: savedUser.UserID,
      Email: savedUser.Email,
      FullName: savedUser.FullName,
      RoleID: savedUser.RoleID,
      Role: savedUser.role,
      CreatedAt: savedUser.CreatedAt,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { UserID: id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);

    return { message: 'User deleted successfully' };
  }

  async getUserRole(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { UserID: id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      UserID: user.UserID,
      Role: user.role,
    };
  }

  async updateUserRole(id: number, roleId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { UserID: id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const role = await this.roleRepository.findOne({
      where: { RoleID: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    user.RoleID = roleId;
    const savedUser = await this.userRepository.save(user);

    return {
      UserID: savedUser.UserID,
      Email: savedUser.Email,
      FullName: savedUser.FullName,
      RoleID: savedUser.RoleID,
      Role: role,
      CreatedAt: savedUser.CreatedAt,
    };
  }
}
