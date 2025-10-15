import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<UserResponseDto[]>;
    findOne(id: number, req: any): Promise<UserResponseDto>;
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    update(id: number, updateUserDto: UpdateUserDto, req: any): Promise<UserResponseDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getUserRole(id: number): Promise<any>;
    updateUserRole(id: number, roleData: {
        roleId: number;
    }): Promise<UserResponseDto>;
}
