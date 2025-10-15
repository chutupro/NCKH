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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
let AuthService = class AuthService {
    userRepository;
    roleRepository;
    jwtService;
    constructor(userRepository, roleRepository, jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, password, fullName } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: { Email: email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const defaultRole = await this.roleRepository.findOne({
            where: { RoleName: 'user' },
        });
        if (!defaultRole) {
            throw new Error('Default user role not found');
        }
        const user = this.userRepository.create({
            Email: email,
            PasswordHash: hashedPassword,
            FullName: fullName,
            RoleID: defaultRole.RoleID,
            CreatedAt: new Date(),
        });
        const savedUser = await this.userRepository.save(user);
        const payload = {
            userId: savedUser.UserID,
            email: savedUser.Email,
            roleId: savedUser.RoleID
        };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                UserID: savedUser.UserID,
                Email: savedUser.Email,
                FullName: savedUser.FullName,
                RoleID: savedUser.RoleID,
                CreatedAt: savedUser.CreatedAt,
            },
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { Email: email },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            userId: user.UserID,
            email: user.Email,
            roleId: user.RoleID
        };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                UserID: user.UserID,
                Email: user.Email,
                FullName: user.FullName,
                RoleID: user.RoleID,
                CreatedAt: user.CreatedAt,
            },
        };
    }
    async getProfile(userId) {
        const user = await this.userRepository.findOne({
            where: { UserID: userId },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
    async refreshToken(user) {
        const payload = {
            userId: user.userId,
            email: user.email,
            roleId: user.roleId
        };
        const access_token = this.jwtService.sign(payload);
        return { access_token };
    }
    async logout(user) {
        return { message: 'Logged out successfully' };
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findOne({
            where: { Email: email },
        });
        if (user && await bcrypt.compare(password, user.PasswordHash)) {
            const { PasswordHash, ...result } = user;
            return result;
        }
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map