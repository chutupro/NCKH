"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../entities/role.entity");
let RolesService = class RolesService {
    roleRepository;
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async findAll() {
        const roles = await this.roleRepository.find();
        return roles.map(role => ({
            RoleID: role.RoleID,
            RoleName: role.RoleName,
            Description: role.Description,
        }));
    }
    async findOne(id) {
        const role = await this.roleRepository.findOne({
            where: { RoleID: id },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return {
            RoleID: role.RoleID,
            RoleName: role.RoleName,
            Description: role.Description,
        };
    }
    async create(createRoleDto) {
        const { roleName, description } = createRoleDto;
        const existingRole = await this.roleRepository.findOne({
            where: { RoleName: roleName },
        });
        if (existingRole) {
            throw new common_1.ConflictException('Role name already exists');
        }
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
    async update(id, updateRoleDto) {
        const role = await this.roleRepository.findOne({
            where: { RoleID: id },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        if (updateRoleDto.roleName && updateRoleDto.roleName !== role.RoleName) {
            const existingRole = await this.roleRepository.findOne({
                where: { RoleName: updateRoleDto.roleName },
            });
            if (existingRole) {
                throw new common_1.ConflictException('Role name already exists');
            }
        }
        Object.assign(role, updateRoleDto);
        const savedRole = await this.roleRepository.save(role);
        return {
            RoleID: savedRole.RoleID,
            RoleName: savedRole.RoleName,
            Description: savedRole.Description,
        };
    }
    async remove(id) {
        const role = await this.roleRepository.findOne({
            where: { RoleID: id },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        await this.roleRepository.remove(role);
        return { message: 'Role deleted successfully' };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map