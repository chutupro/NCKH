import { Module } from '@nestjs/common';
import { CompaniesController } from '../controllers/companies.controller';
import { CompaniesService } from '../services/companies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
