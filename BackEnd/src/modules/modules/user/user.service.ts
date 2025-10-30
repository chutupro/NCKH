import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/modules/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  async createUser(email: string, password: string, fullName?: string, role?: string) {
    const existing = await this.userRepo.findOne({ where: { Email: email } });
    if (existing) throw new Error('Email đã được sử dụng.');

    const hash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      Email: email,
      PasswordHash: hash,
      FullName: fullName ?? '',
      RoleID: role ? Number(role) : undefined,
    });

    const savedUser = await this.userRepo.save(user);
    return savedUser;
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { Email: email } });
  }

  async findById(id: number) {
    return this.userRepo.findOne({ where: { UserID: id } });
  }
  
  async setRefreshTokenHash(userId: number, refreshTokenHash: string | null) {
    await this.userRepo.update({ UserID: userId }, { RefreshTokenHash: refreshTokenHash });
  }

  async getRefreshTokenHash(userId: number) {
    const user = await this.findById(userId);
    return user?.RefreshTokenHash ?? null;
  }
  
}
