import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';


@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private deptRepo: Repository<Department>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const dept = this.deptRepo.create({
      name: dto.name,
      company: { id: dto.companyId } as any,
    });
    return this.deptRepo.save(dept);
  }

  async findAll(): Promise<Department[]> {
    return this.deptRepo.find({ relations: ['company', 'employees', 'teams'] });
  }

  async findOne(id: number): Promise<Department> {
    const dept = await this.deptRepo.findOne({
      where: { id },
      relations: ['company', 'employees', 'teams'],
    });
    if (!dept) {
      throw new NotFoundException('Không tìm thấy phòng ban');
    }
    return dept;
  }
}
