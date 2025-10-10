import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import { EmployeeDetail } from '../entities/employee-detail.entity';
import { EmployeesController } from '../controllers/employees.controller';
import { EmployeesService } from '../services/employees.service';
import { DepartmentsModule } from 'src/modules/departments/module/departments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, EmployeeDetail]),DepartmentsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
