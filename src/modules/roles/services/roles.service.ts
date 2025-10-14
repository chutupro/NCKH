import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../models/dtos/create-role.dto';
import { RoleResponseDto } from '../models/dtos/role-response.dto';

/**
 * Roles service
 */
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Creates new role
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const existingRole = await this.findRoleByName(createRoleDto.roleName);
    if (existingRole) {
      throw new ConflictException('Role already exists');
    }
    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);
    return this.mapToResponseDto(savedRole);
  }

  /**
   * Gets all roles
   */
  async getAllRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.find();
    return roles.map((role) => this.mapToResponseDto(role));
  }

  /**
   * Gets role by ID
   */
  async getRoleById({ roleId }: { roleId: number }): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.mapToResponseDto(role);
  }

  /**
   * Deletes role
   */
  async deleteRole({ roleId }: { roleId: number }): Promise<void> {
    const result = await this.roleRepository.delete(roleId);
    if (!result.affected) {
      throw new NotFoundException('Role not found');
    }
  }

  /**
   * Finds role by name
   */
  private async findRoleByName(roleName: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { roleName } });
  }

  /**
   * Maps role entity to response DTO
   */
  private mapToResponseDto(role: Role): RoleResponseDto {
    return {
      roleId: role.roleId,
      roleName: role.roleName,
      description: role.description,
    };
  }
}

