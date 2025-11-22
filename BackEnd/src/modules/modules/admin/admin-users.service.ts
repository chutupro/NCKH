import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Users } from '../../entities/user.entity';
import { UserProfiles } from '../../entities/user-profile.entity';
import { Feedback } from '../../entities/feedback.entity';
import * as bcrypt from 'bcrypt';

export interface UserFilter {
  search?: string;
  page: number;
  limit: number;
  role?: number;
  status?: string;
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(UserProfiles)
    private readonly userProfileRepo: Repository<UserProfiles>,
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
  ) {}

  async getAllUsers(filter: UserFilter) {
    const { search, page, limit, role, status } = filter;

    const query = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.UserID',
        'user.Email',
        'user.FullName',
        'user.RoleID',
        'user.CreatedAt',
        'user.IsEmailVerified',
        'role.RoleID',
        'role.RoleName',
      ]);

    if (search) {
      query.where('(user.FullName LIKE :search OR user.Email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (role) {
      query.andWhere('user.RoleID = :role', { role });
    }

    if (status === 'active') {
      query.andWhere('user.IsEmailVerified = :verified', { verified: true });
    } else if (status === 'inactive') {
      query.andWhere('user.IsEmailVerified = :verified', { verified: false });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    query.orderBy('user.CreatedAt', 'DESC');

    const [users, total] = await query.getManyAndCount();

    return {
      data: users.map(user => ({
        id: user.UserID,
        email: user.Email,
        fullName: user.FullName,
        roleId: user.RoleID,
        roleName: user.role?.RoleName || 'Unknown',
        status: user.IsEmailVerified ? 'active' : 'inactive',
        createdAt: user.CreatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { UserID: id },
      relations: ['role', 'profile'],
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    return {
      id: user.UserID,
      email: user.Email,
      fullName: user.FullName,
      roleId: user.RoleID,
      roleName: user.role?.RoleName || 'Unknown',
      status: user.IsEmailVerified ? 'active' : 'inactive',
      createdAt: user.CreatedAt,
      profile: user.profile,
    };
  }

  async createUser(dto: { email: string; password: string; fullName: string; roleId: number }) {

    const existing = await this.userRepo.findOne({ where: { Email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      Email: dto.email,
      PasswordHash: passwordHash,
      FullName: dto.fullName,
      RoleID: dto.roleId,
      IsEmailVerified: true, // Admin tạo thì tự động verified
    });

    await this.userRepo.save(user);

    return {
      message: 'Tạo user thành công',
      userId: user.UserID,
    };
  }

  async updateUser(id: number, dto: { roleId?: number; status?: string; fullName?: string }) {
    const user = await this.userRepo.findOne({ where: { UserID: id } });
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    if (dto.roleId !== undefined) {
      user.RoleID = dto.roleId;
    }

    if (dto.status !== undefined) {
      user.IsEmailVerified = dto.status === 'active';
    }

    if (dto.fullName !== undefined) {
      user.FullName = dto.fullName;
    }

    await this.userRepo.save(user);

    return {
      message: 'Cập nhật user thành công',
    };
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { UserID: id } });
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    try {

      await this.feedbackRepo.delete({ UserID: id });

      try {
        await this.userRepo.query('DELETE FROM notifications WHERE UserID = ?', [id]);
      } catch (err) {
        console.log('⚠️ Table notifications not found, skipping...');
      }

      try {
        await this.userRepo.query('DELETE FROM likes WHERE UserID = ?', [id]);
      } catch (err) {
        console.log('⚠️ Table likes not found, skipping...');
      }

      try {
        await this.userRepo.query('DELETE FROM comments WHERE UserID = ?', [id]);
      } catch (err) {
        console.log('⚠️ Table comments not found, skipping...');
      }

      try {
        await this.userRepo.query('DELETE FROM contributions WHERE UserID = ?', [id]);
      } catch (err) {
        console.log('⚠️ Table contributions not found, skipping...');
      }

      try {
        await this.userRepo.query('DELETE FROM moderation_logs WHERE ModeratorID = ?', [id]);
      } catch (err) {
        console.log('⚠️ Table moderation_logs not found, skipping...');
      }

      try {
        await this.userRepo.query('DELETE FROM articles WHERE UserID = ?', [id]);
      } catch (err) {
        console.log('⚠️ Table articles not found, skipping...');
      }

      const profile = await this.userProfileRepo.findOne({ where: { UserID: id } });
      if (profile) {
        await this.userProfileRepo.remove(profile);
      }

      await this.userRepo.remove(user);

      return {
        message: 'Xóa user và tất cả dữ liệu liên quan thành công',
      };
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw new BadRequestException('Không thể xóa user. Vui lòng thử lại.');
    }
  }

  async getUserStats() {
    const total = await this.userRepo.count();
    const active = await this.userRepo.count({ where: { IsEmailVerified: true } });
    const inactive = total - active;

    const adminCount = await this.userRepo.count({ where: { RoleID: 1 } });
    const editorCount = await this.userRepo.count({ where: { RoleID: 4 } });

    return {
      total,
      active,
      inactive,
      admins: adminCount,
      editors: editorCount,
    };
  }
}
