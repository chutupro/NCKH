import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
export declare class RolesService {
    private roleRepository;
    constructor(roleRepository: Repository<Role>);
    findAll(): Promise<RoleResponseDto[]>;
    findOne(id: number): Promise<RoleResponseDto>;
    create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto>;
    update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
