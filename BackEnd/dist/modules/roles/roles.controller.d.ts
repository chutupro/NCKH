import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(): Promise<RoleResponseDto[]>;
    findOne(id: number): Promise<RoleResponseDto>;
    create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto>;
    update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
