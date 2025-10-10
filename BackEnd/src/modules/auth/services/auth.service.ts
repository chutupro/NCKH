import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../../employees/entities/employee.entity';
import { RegisterDto } from '../dto/register.dto';
import { SystemRole } from '../../../common/enums/role.enum';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Employee> {
    const exists = await this.employeeRepo.findOneBy({ email: dto.email });
    if (exists) {
      throw new ConflictException('Email đã được đăng ký');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const joinedAt = new Date().toISOString().split('T')[0];

    const employee = this.employeeRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      department: { id: dto.departmentId } as any,
      joinedAt,
      role: SystemRole.NHAN_VIEN,
    });

    return this.employeeRepo.save(employee);
  }

  async login(dto: LoginDto): Promise<{ access_token: string; employee: { id: number; email: string; fullName: string; role: SystemRole } }> {
    const employee = await this.employeeRepo.findOne({
      where: { email: dto.email },
      relations: ['department'],
    });

    if (!employee) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, employee.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const payload = { 
      sub: employee.id, 
      email: employee.email, 
      role: employee.role 
    };

    return { 
      access_token: this.jwtService.sign(payload),
      employee: {
        id: employee.id,
        email: employee.email,
        fullName: employee.fullName,
        role: employee.role,
      },
    };
  }
}
