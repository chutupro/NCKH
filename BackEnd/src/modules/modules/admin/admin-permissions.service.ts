import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../../common/redis.service';
import { Users } from '../../entities/user.entity';

interface RolePermissions {
  content: string[];
  users: string[];
}

@Injectable()
export class AdminPermissionsService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  private getDefaultPermissions(role: string): RolePermissions {
    const defaults: Record<string, RolePermissions> = {
      Admin: {
        content: ['read', 'create', 'edit', 'delete', 'approve'],
        users: ['read', 'create', 'edit', 'delete'],
      },
      Editor: {
        content: ['read', 'create', 'edit'],
        users: ['read'],
      },
      User: {
        content: [],
        users: [],
      },
    };

    return defaults[role] || { content: [], users: [] };
  }

  async getPermissions(role: string) {
    const key = `permissions:${role}`;

    try {
      const data = await this.redisService.get(key);

      if (!data) {

        const defaultPerms = this.getDefaultPermissions(role);
        await this.redisService.set(key, JSON.stringify(defaultPerms));
        return {
          success: true,
          data: defaultPerms,
        };
      }

      return {
        success: true,
        data: JSON.parse(data),
      };
    } catch (error) {

      return {
        success: true,
        data: this.getDefaultPermissions(role),
      };
    }
  }

  async updatePermissions(role: string, permissions: RolePermissions) {
    const key = `permissions:${role}`;

    try {
      await this.redisService.set(key, JSON.stringify(permissions));
      return {
        success: true,
        message: `✅ Đã lưu quyền cho role ${role}`,
      };
    } catch (error) {
      throw new Error('Lỗi khi lưu quyền vào Redis');
    }
  }

  async getRoleStats() {
    const cacheKey = 'role_stats';

    try {

      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return {
          success: true,
          data: JSON.parse(cached),
          cached: true,
        };
      }

      const users = await this.userRepository.find({
        relations: ['role'],
        select: ['UserID', 'RoleID'],
      });

      const stats = {
        Admin: 0,
        Editor: 0,
        User: 0,
      };

      users.forEach(user => {
        if (user.RoleID === 1) stats.Admin++;
        else if (user.RoleID === 4) stats.Editor++;
        else if (user.RoleID === 2) stats.User++;
      });

      await this.redisService.set(cacheKey, JSON.stringify(stats), 300);

      return {
        success: true,
        data: stats,
        cached: false,
      };
    } catch (error) {
      console.error('Error getting role stats:', error);

      return {
        success: true,
        data: { Admin: 0, Editor: 0, User: 0 },
        cached: false,
      };
    }
  }
}
