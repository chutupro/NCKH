import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { Users } from '../../entities/user.entity';
import { UserProfiles } from '../../entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserProfiles])],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminModule {}
