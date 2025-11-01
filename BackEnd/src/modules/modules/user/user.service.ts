import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/modules/entities/user.entity';
import { UserProfiles } from 'src/modules/entities/user-profile.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(UserProfiles)
    private readonly profileRepo: Repository<UserProfiles>,
  ) {}

  async createUser(email: string, password: string, fullName?: string, role?: string) {
    const existing = await this.userRepo.findOne({ where: { Email: email } });
    if (existing) throw new Error('Email đã được sử dụng.');

    const hash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      Email: email,
      PasswordHash: hash,
      FullName: fullName ?? '',
      RoleID: role ? Number(role) : 2,
    });

    const savedUser = await this.userRepo.save(user);

    const profile = this.profileRepo.create({
      UserID: savedUser.UserID,
      Avatar: '/img/default-avatar.png',
      Bio: '',
      TotalContributions: 0,
      TotalEdits: 0,
      TotalLikes: 0,
    });

    await this.profileRepo.save(profile);
    return savedUser;
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { Email: email } });
  }

  async findById(id: number) {
    return this.userRepo.findOne({ where: { UserID: id } });
  }

  async createUserProfile(userId: number) {
    const existingProfile = await this.profileRepo.findOne({ where: { UserID: userId } });
    if (existingProfile) {
      console.log(' Profile already exists');
      return existingProfile;
    }

    const profile = this.profileRepo.create({
      UserID: userId,
      Avatar: '/img/default-avatar.png',
      Bio: '',
      TotalContributions: 0,
      TotalEdits: 0,
      TotalLikes: 0,
    });

    const savedProfile = await this.profileRepo.save(profile);
    console.log(' Profile created');
    return savedProfile;
  }
}
