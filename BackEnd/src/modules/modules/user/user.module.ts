import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Users } from 'src/modules/entities/user.entity';
import { UserProfiles } from 'src/modules/entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserProfiles])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
