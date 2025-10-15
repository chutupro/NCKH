import { User } from './user.entity';
export declare class Role {
    RoleID: number;
    RoleName: string;
    Description: string;
    users: User[];
}
