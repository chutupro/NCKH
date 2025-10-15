"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
let UsersService = class UsersService {
    userRepository;
    roleRepository;
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async findAll() {
        const users = await this.userRepository.find({
            relations: ['role'],
        });
        return users.map(user => ({
            UserID: user.UserID,
            Email: user.Email,
            FullName: user.FullName,
            RoleID: user.RoleID,
            Role: user.role,
            CreatedAt: user.CreatedAt,
        }));
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { UserID: id },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return {
            UserID: user.UserID,
            Email: user.Email,
            FullName: user.FullName,
            RoleID: user.RoleID,
            Role: user.role,
            CreatedAt: user.CreatedAt,
        };
    }
    async create(createUserDto) {
        const { email, password, fullName, roleId } = createUserDto;
        const existingUser = await this.userRepository.findOne({
            where: { Email: email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const role = await this.roleRepository.findOne({
            where: { RoleID: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = this.userRepository.create({
            Email: email,
            PasswordHash: hashedPassword,
            FullName: fullName,
            RoleID: roleId,
            CreatedAt: new Date(),
        });
        const savedUser = await this.userRepository.save(user);
        return {
            UserID: savedUser.UserID,
            Email: savedUser.Email,
            FullName: savedUser.FullName,
            RoleID: savedUser.RoleID,
            Role: role,
            CreatedAt: savedUser.CreatedAt,
        };
    }
    async update(id, updateUserDto) {
        const user = await this.userRepository.findOne({
            where: { UserID: id },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (updateUserDto.email && updateUserDto.email !== user.Email) {
            const existingUser = await this.userRepository.findOne({
                where: { Email: updateUserDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        if (updateUserDto.password) {
            const saltRounds = 10;
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
        }
        Object.assign(user, {
            ...updateUserDto,
            UpdatedAt: new Date(),
        });
        const savedUser = await this.userRepository.save(user);
        return {
            UserID: savedUser.UserID,
            Email: savedUser.Email,
            FullName: savedUser.FullName,
            RoleID: savedUser.RoleID,
            Role: savedUser.role,
            CreatedAt: savedUser.CreatedAt,
        };
    }
    async remove(id) {
        const user = await this.userRepository.findOne({
            where: { UserID: id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        await this.userRepository.remove(user);
        return { message: 'User deleted successfully' };
    }
    async getUserRole(id) {
        const user = await this.userRepository.findOne({
            where: { UserID: id },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return {
            UserID: user.UserID,
            Role: user.role,
        };
    }
    async updateUserRole(id, roleId) {
        const user = await this.userRepository.findOne({
            where: { UserID: id },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const role = await this.roleRepository.findOne({
            where: { RoleID: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        user.RoleID = roleId;
        const savedUser = await this.userRepository.save(user);
        return {
            UserID: savedUser.UserID,
            Email: savedUser.Email,
            FullName: savedUser.FullName,
            RoleID: savedUser.RoleID,
            Role: role,
            CreatedAt: savedUser.CreatedAt,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map