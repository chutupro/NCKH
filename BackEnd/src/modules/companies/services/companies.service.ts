import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { getRepository, InsertResult, Repository } from 'typeorm';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { audit } from 'rxjs';

@Injectable()
export class CompaniesService {
     constructor(
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  async create(dto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepo.create(dto);
    return this.companyRepo.save(company);
  }
  
   async createQuery(dto: CreateCompanyDto): Promise<Company> {
    const company: InsertResult = await this.companyRepo.createQueryBuilder('cp')
    .insert()
    .into('Company')
    .values(dto)
    .execute();
    const id: number= company.identifiers[0].id;
    return await this.findOneQuery(id);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({ relations: ['departments'] });
  }

  async findAllQuery(): Promise<Company[]> {
    const company: Company[] = await this.companyRepo.createQueryBuilder('cp')
    .leftJoinAndSelect('cp.departments','departments')
    .getMany();
    return company;
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['departments'],
    });
    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }
    return company;
  }

   async findOneQuery(id: number): Promise<Company> {
    const company: Company = await this.companyRepo.createQueryBuilder('cp')
    .leftJoinAndSelect('cp.departments','departments')
    .where('cp.id=:id',{id})
    .getOneOrFail()
    .catch(()=>{
      throw new NotFoundException('Không tìm thấy công ty');
    });    
    return company;
  }
}
