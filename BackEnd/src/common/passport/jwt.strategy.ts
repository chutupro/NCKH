import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Employee } from 'src/modules/employees/entities/employee.entity';
import { log } from 'console';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any):Promise<Employee> {    
    const employee = await this.employeeRepo.findOne({
      where: { id: payload.sub },
      relations: [ 'department', 'department.company', 'detail', 'teamMemberships', 'teamMemberships.team'],
    });
    
    if (!employee) {
        throw new ForbiddenException('Token không hợp lệ hoặc đã hết hạn');
    }

    return employee;
  }
}
