import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '7d',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '30d',
      };
      return config[key];
    }),
  };

  const mockRole = {
    roleId: 1,
    roleName: 'User',
    description: 'Standard user',
  };

  const mockUser = {
    userId: 1,
    email: 'test@example.com',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
    fullName: 'Test User',
    roleId: 1,
    role: mockRole,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
      };
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockJwtService.sign.mockReturnValue('test-token');
      const result = await service.register(registerDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('test-token');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Existing User',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });
});

