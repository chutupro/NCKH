import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { TeamsController } from '../controllers/teams.controller';
import { TeamsService } from '../services/teams.service';
import { EmployeesService } from 'src/modules/employees/services/employees.service';
import { EmployeesModule } from 'src/modules/employees/module/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember]),EmployeesModule],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
