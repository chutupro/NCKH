import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminPermissionsController } from './admin-permissions.controller';
import { AdminPermissionsService } from './admin-permissions.service';
import { Users } from '../../entities/user.entity';
import { UserProfiles } from '../../entities/user-profile.entity';
import { RedisService } from '../../../common/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserProfiles])],
  controllers: [AdminUsersController, AdminPermissionsController],
  providers: [AdminUsersService, AdminPermissionsService, RedisService],
})
export class AdminModule {}
