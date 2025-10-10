import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.find();
    return roles.map(role => ({
      RoleID: role.RoleID,
      RoleName: role.RoleName,
      Description: role.Description,
    }));
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { RoleID: id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return {
      RoleID: role.RoleID,
      RoleName: role.RoleName,
      Description: role.Description,
    };
  }

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const { roleName, description } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({
      where: { RoleName: roleName },
    });

    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    // Create new role
    const role = this.roleRepository.create({
      RoleName: roleName,
      Description: description,
    });

    const savedRole = await this.roleRepository.save(role);

    return {
      RoleID: savedRole.RoleID,
      RoleName: savedRole.RoleName,
      Description: savedRole.Description,
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { RoleID: id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Check if new role name already exists (if being changed)
    if (updateRoleDto.roleName && updateRoleDto.roleName !== role.RoleName) {
      const existingRole = await this.roleRepository.findOne({
        where: { RoleName: updateRoleDto.roleName },
      });

      if (existingRole) {
        throw new ConflictException('Role name already exists');
      }
    }

    // Update role
    Object.assign(role, updateRoleDto);
    const savedRole = await this.roleRepository.save(role);

    return {
      RoleID: savedRole.RoleID,
      RoleName: savedRole.RoleName,
      Description: savedRole.Description,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const role = await this.roleRepository.findOne({
      where: { RoleID: id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    await this.roleRepository.remove(role);

    return { message: 'Role deleted successfully' };
  }
}
