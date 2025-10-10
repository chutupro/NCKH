export class UserResponseDto {
  UserID: number;
  Email: string;
  FullName: string;
  RoleID: number;
  Role?: {
    RoleID: number;
    RoleName: string;
    Description: string;
  };
  CreatedAt: Date;
}
