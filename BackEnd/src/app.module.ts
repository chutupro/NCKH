import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseModule } from './common/database.module';
import { CompaniesModule } from './modules/companies/module/companies.module';
import { DepartmentsModule } from './modules/departments/module/departments.module';
import { EmployeesModule } from './modules/employees/module/employees.module';
import { TeamsModule } from './modules/teams/module/teams.module';
import { AuthModule } from './modules/auth/module/auth.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';

@Module({
  imports: [databaseModule,CompaniesModule,DepartmentsModule,EmployeesModule,TeamsModule,AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
