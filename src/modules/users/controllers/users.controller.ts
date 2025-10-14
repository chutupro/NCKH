import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../models/dtos/create-user.dto';
import { UpdateUserDto } from '../models/dtos/update-user.dto';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Users controller
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create new user (Admin only)
   */
  @Post()
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getCurrentUser(@CurrentUser() user: { userId: number }) {
    return this.usersService.getUserById({ userId: user.userId });
  }

  /**
   * Get all users (Admin only)
   */
  @Get()
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.getUserById({ userId });
  }

  /**
   * Update user
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: { userId: number; role: string },
  ) {
    if (currentUser.role !== ROLES.ADMIN && currentUser.userId !== userId) {
      return { message: 'Unauthorized' };
    }
    return this.usersService.updateUser({ userId, updateUserDto });
  }

  /**
   * Delete user (Admin only)
   */
  @Delete(':id')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseIntPipe) userId: number) {
    await this.usersService.deleteUser({ userId });
    return { message: 'User deleted successfully' };
  }

  /**
   * Smoke test endpoint for admin
   */
  @Get('admin/test')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Admin smoke test' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return { message: 'Users admin test successful' };
  }
}

