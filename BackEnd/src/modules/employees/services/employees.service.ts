import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../entities/employee.entity';
import { EmployeeDetail } from '../entities/employee-detail.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { SystemRole } from 'src/common/enums/role.enum';
import { UpdateEmployeeDetailDto } from '../dto/update-employee-detail.dto';
import { updateEmployee } from '../dto/update-employee.dto';
import { DepartmentsService } from 'src/modules/departments/services/departments.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(EmployeeDetail)
    private detailRepo: Repository<EmployeeDetail>,

    private readonly departmentsService: DepartmentsService
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const exists = await this.employeeRepo.findOne({ where: { email: dto.email } });
    console.log(exists);
    if (exists) {
      throw new ConflictException('Email đã tồn tại');
    }
    const department = await this.departmentsService.findOne(dto.departmentId);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const joinedAt = new Date().toISOString().split('T')[0];

    const employee = this.employeeRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      department,
      joinedAt,
      baseSalary: dto.baseSalary || 0,
      role: dto.role || SystemRole.NHAN_VIEN,
    });

    return this.employeeRepo.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepo.find({
      relations: ['department', 'detail'],
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        baseSalary: true,
        joinedAt: true,
      },
    });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['department', 'detail', 'teamMemberships'],
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        baseSalary: true,
        joinedAt: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    return employee;
  }

  async updateDetail(id: number, dto: UpdateEmployeeDetailDto): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    const detail = await this.detailRepo.findOne({ where: { employeeId: id } });
    if (detail) {
      await this.detailRepo.update({ employeeId: id }, dto);
    } else {
      const detail = this.detailRepo.create({
        employeeId: id,
        ...dto,
      });
      await this.detailRepo.save(detail);
    }

    return this.findOne(id);
  }

  async updateEmployee(id: number, dto: updateEmployee): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    const detail = await this.employeeRepo.findOne({ where: { id: id } });
    if (detail) {
      await this.employeeRepo.update({ id: id }, dto);
    } 
    return this.findOne(id);
  }

  

  async checkAdmin(id: number): Promise<boolean> {
     const employee = await this.findOne(id);
     if(employee.role===SystemRole.ADMIN)
      return true;
    return false;
  }

  async findPage(page = 1, limit = 10,) 
  { const query = this.employeeRepo.createQueryBuilder('team') 
    .leftJoinAndSelect('team.department', 'department') 
    .leftJoinAndSelect('team.members', 'members') 
    .leftJoinAndSelect('members.employee', 'employee') 
    .orderBy('team.id', 'DESC');
    const skip = (page - 1) * limit; 
    const [data, total] = await query 
    .skip(skip) 
    .take(limit) 
    .getManyAndCount();
  }
}
